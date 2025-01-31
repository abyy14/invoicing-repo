import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { Customers, Invoices } from "@/db/schema";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { createPayment, updateStatusAction } from "@/app/actions";
import Stripe from 'stripe'

const stripe = new Stripe(String(process.env.STRIPE_API_SECRET))

type InvoiceProps  ={
  params: Promise<{ invoiceId: string }>;
  searchParams:  Promise<{ status: string; session_id: string }>;
}


export default async function Invoice({
  params,
  searchParams
}: InvoiceProps) {
  const { invoiceId } = await params;
  const { status, session_id } = await searchParams;

  const invoiceIdParsed = parseInt(invoiceId);
  const isSuccess = session_id && status === 'success';
  const isCanceled = status === 'canceled';
 
  console.log(searchParams)

  if (isNaN(invoiceIdParsed)) {
    throw new Error("Invalid Invoice ID");
  }
  let isError = isSuccess && !session_id
  if(isSuccess) {
    const {payment_status} = await stripe.checkout.sessions.retrieve(session_id);
    if(payment_status !== 'paid') {
      isError = true;
    }
    else {
      const formData = new FormData();
      formData.append('id', String(invoiceId))
      formData.append('status', 'paid');
      await updateStatusAction(formData)
    }
   
  }
  const [result] = await db
    .select({
      id: Invoices.id,
      status: Invoices.status,
      createTs: Invoices.createTs,
      description: Invoices.description,
      value: Invoices.value,
      name: Customers.name,
    })
    .from(Invoices)
    .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
    .where(eq(Invoices.id, invoiceIdParsed))
    .limit(1);

  if (!result) notFound();

  const invoice = {
    ...result,
    customer: { name: result.name },
  };
  return (
    <main className=" h-full w-full">
      <Container>
        {isError && (
          <p className="bg-red-100 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6" >Something went wrong, please try again!</p>
        )}
         {isCanceled && (
          <p className="bg-yellow-100 text-sm text-yellow-800 text-center px-3 py-2 rounded-lg mb-6" >Payment was cancelled, please try again.</p>
        )}
        <div className="grid grid-cols-2">
      <div>
        <div className="flex justify-between mb-8">
          <h1 className="flex items-center gap-4 text-3xl  font-bold">
            Invoice {invoice.id}
            <Badge
              className={cn(
                "rounded-full capitalize",
                invoice.status === "open" && "bg-blue-500",
                invoice.status === "paid" && "bg-green-600",
                invoice.status === "void" && "bg-zinc-700",
                invoice.status === "uncollectible" && "bg-red-600"
              )}
            >
              {invoice.status}
            </Badge>
          </h1>
        </div>
        <p className="text-3xl mb-3">${(invoice.value / 100).toFixed(2)}</p>
        <p className="text-3xl mb-8">{invoice.description}</p>
       </div>
       <div>
        <h2 className="text-xl font-bold mb-4">Manage Invoice</h2>
        {invoice.status === 'open' && (
          <form action={createPayment}>
            <input type="hidden" name="id" value={invoice.id}/>
          <Button className="flex gap-2 bg-green-700 font-bold">
            <CreditCard className="w-5 h-auto"/>
            Pay Invoice
          </Button>
        </form>
        )}
        {invoice.status === 'paid' && (
          <p className="flex gap-2 items-centertext-xl font-bold">
            <Check className="w-6 h-auto bg-green-500 rounded-full text-white p-1"/>
            Invoice paid</p>
        )}
        
       </div>
       </div>
        <h2 className="font-bold text-lg mb-4">Billing Details</h2>
        <ul className="grid gap-2">
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice ID
            </strong>
            <span>{invoice.id}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice Date
            </strong>
            <span>{new Date(invoice.createTs).toLocaleDateString()}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Name
            </strong>
            <span>{invoice.customer.name}</span>
          </li>
        </ul>
      </Container>
    </main>
  );
}
