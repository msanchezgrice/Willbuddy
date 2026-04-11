import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      typescript: true,
    });
  }
  return _stripe;
}

const PRICE_AMOUNT_CENTS = 4900; // $49 one-time
const CURRENCY = "usd";

/**
 * Create a Stripe Checkout Session for document generation.
 * Returns the checkout session URL the client should redirect to.
 */
export async function createCheckoutSession(
  sessionId: string,
  userEmail: string
): Promise<string> {
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          unit_amount: PRICE_AMOUNT_CENTS,
          product_data: {
            name: "WillBuddy Document Package",
            description:
              "Complete estate planning document generation — Will, POA, Healthcare Directive & more",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      willbuddy_session_id: sessionId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/summary/${sessionId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/session/${sessionId}`,
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return checkoutSession.url;
}
