# PromptPay alongside card subscriptions — plan

**Prepared:** 3 Sep 2026 · ATOM
**Decision:** keep both — cards stay on subscription with auto-renew; PromptPay
is added as a separate one-time purchase that grants the same slot.
**Status:** plan only, nothing implemented. Touches the money path, so it needs
sign-off before code.

---

## 1. Why it cannot just be a config line

`payment_method_types: ['card', 'promptpay']` on the current session would fail.
Both checkout routes use `mode: 'subscription'`, and **Stripe's PromptPay
supports one-time payments only** — it cannot be used for recurring billing, and
is hidden entirely on subscriptions that have a trial.

So PromptPay needs its own `mode: 'payment'` session. That is the easy part.
The three below are the parts that will bite.

---

## 2. The idempotency hole — the one that costs money

The webhook's duplicate guard reads:

```js
if (subscriptionId) {
  // look for an existing slot with this stripe_subscription_id
}
```

A one-time payment has **no subscription**, so `subscriptionId` is `null` and
**the guard is skipped entirely**. Stripe retries `checkout.session.completed`
on any non-2xx or timeout — and this route deliberately returns 500 on a grant
shortfall so that it *does* retry. A PromptPay purchase that fails once and
succeeds on retry would grant the slots twice.

**Fix:** add `stripe_checkout_session_id` to `listing_slots`, write it on every
grant, and guard on it whenever there is no subscription id.

```sql
ALTER TABLE public.listing_slots
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE INDEX IF NOT EXISTS listing_slots_checkout_session_idx
  ON public.listing_slots (stripe_checkout_session_id);
```

The guard then covers both paths: subscription id when present, session id
otherwise. Worth writing the session id on the card path too — it costs nothing
and makes every grant traceable to a checkout.

---

## 3. PromptPay is asynchronous — do not grant on `completed`

A card is charged before `checkout.session.completed` fires. **PromptPay is
not.** The customer is shown a QR code; the session can complete while the
payment is still pending, and it may never be paid at all.

The current handler grants on `checkout.session.completed` with **no
`payment_status` check**. That is safe for cards and wrong for PromptPay: an
abandoned QR would be granted a slot.

**Fix — gate the grant on payment_status, and handle the async events:**

| Event | `payment_status` | Action |
|---|---|---|
| `checkout.session.completed` | `paid` | Grant (cards, and PromptPay paid immediately) |
| `checkout.session.completed` | `no_payment_required` | **Grant.** See below. |
| `checkout.session.completed` | `unpaid` | **Do nothing.** Log and wait. |
| `checkout.session.async_payment_succeeded` | — | Grant |
| `checkout.session.async_payment_failed` | — | Log, notify, grant nothing |

> **`no_payment_required` must grant, and getting this wrong breaks SM299.**
>
> An SM299 purchase that comes to ฿0 collects no payment, so Stripe completes
> the session as `no_payment_required`, not `paid`. A gate written as
> `payment_status === 'paid'` would refuse the slot: the customer redeems the
> code, is charged nothing exactly as intended, and receives nothing.
>
> It would also break the **card** path, which works today precisely because
> this handler checks no status at all. Adding a naive equality check here
> would silently kill every free-first-month subscription.
>
> So the condition is negative, not positive: **do nothing when `unpaid`,
> grant otherwise.** Written that way, current card behaviour is unchanged and
> only the genuinely-pending PromptPay case is held back.

Both new events must be enabled on the Stripe webhook endpoint. If they are not
subscribed, a paid PromptPay purchase silently never grants — the customer pays
and receives nothing, which is the exact failure this route already has a loud
500 for on the card path.

---

## 4. SM299 at ฿0 on PromptPay — allowed. Decided 3 Sep.

**Founder's decision: allow it.** SM299 is one redemption per account. A ฿0
first purchase does not create an ongoing free ride, because the slot expires
and the customer must buy a new one to keep publishing.

I had recommended blocking PromptPay on a ฿0 total, reasoning that the card
requirement on the subscription path is what stops throwaway-email farming.
That reasoning over-weighted the risk. The exposure per account is one month of
one Basic slot — ฿299 of foregone revenue, non-renewing and capped. That is an
acquisition cost, and a cheap one for a site whose actual constraint is listing
inventory rather than revenue. Someone determined to farm free months with new
email addresses produces listings, which is the thing we are short of; if they
produce junk listings that is a moderation problem, not a billing one.

**Consequence for the implementation:** a ฿0 session collects no payment and
completes as `no_payment_required`. See the warning in §3 — this is why the
grant condition must be written as "not `unpaid`" rather than "is `paid`".

---

## 5. What the customer sees

Two buttons on each pricing card, not a payment-method dropdown — the difference
is not just how you pay, it is what you get:

- **ชำระด้วยบัตร — ต่ออัตโนมัติ** (subscription; renews until cancelled)
- **ชำระด้วยพร้อมเพย์ — จ่ายครั้งเดียว** (one-time; expires, no auto-renew)

The renewal difference must be on the button, not in a footnote. A landlord who
thinks PromptPay auto-renews and finds their listing down after 30 days is a
support case and a churn event.

**Expiry warning matters more on this path.** A card subscriber who forgets is
renewed automatically; a PromptPay buyer just goes dark. Whatever expiry
reminder exists today should be checked against the PromptPay case
specifically — this is the population that will actually hit it.

---

## 6. Build order

1. Migration: `stripe_checkout_session_id` + index
2. `grantSlots` accepts and writes it
3. Webhook: guard on session id when no subscription; gate on `payment_status`
4. Webhook: handle `async_payment_succeeded` / `async_payment_failed`
5. New route `/api/stripe/buy-slots-promptpay` — `mode: 'payment'`, inline
   `price_data` from `PACKAGE_PRICE_THB`, same metadata contract
6. Enable the two async events on the Stripe endpoint **before** shipping 5
7. `BuySlotsCta`: second button
8. Update the pricing FAQ — it currently says card only

---

## 7. How to verify

- [ ] PromptPay purchase, QR paid → exactly one slot per quantity
- [ ] PromptPay purchase, QR abandoned → **no slot**, no error to the customer
- [ ] Resend `checkout.session.completed` from the Stripe dashboard → no second grant
- [ ] Card purchase still grants and still auto-renews
- [ ] PromptPay slot has `expires_at` set and does **not** renew
- [ ] SM299 on PromptPay behaves per the option chosen in §4

---

*Nothing in this plan has been implemented.*
