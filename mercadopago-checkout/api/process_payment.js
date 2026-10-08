import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN,
});

const payment = new Payment(client);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      token,
      transaction_amount,
      description,
      installments,
      payment_method_id,
      issuer_id,
      payer,
    } = req.body;

    const paymentData = {
      transaction_amount: Number(transaction_amount),
      token,
      description: description || "Assinatura",
      installments: Number(installments) || 1,
      payment_method_id,
      issuer_id: issuer_id ? Number(issuer_id) : undefined,
      payer: {
        email: payer?.email,
        identification: payer?.identification
          ? {
              type: payer.identification.type,
              number: payer.identification.number,
            }
          : undefined,
      },
    };

    const result = await payment.create({ body: paymentData });

    return res.status(201).json({
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      payment_method_id: result.payment_method_id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.cause?.[0]?.description || error.message || "Erro ao processar pagamento",
    });
  }
}