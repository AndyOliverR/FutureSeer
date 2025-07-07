import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || ""

  return NextResponse.json({
    clientId: clientId,
    currency: "USD", // Changed to USD for better PayPal compatibility
    intent: "capture",
    hasPayPal: clientId !== "",
  })
}
