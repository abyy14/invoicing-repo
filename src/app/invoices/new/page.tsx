"use client"
import { createAction } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {  SyntheticEvent, useState } from "react";
import Form from 'next/form'
import Container from "@/components/Container";

export default function Home() {
  const [isPending, setPending] = useState('ready')

  async function handleOnSubmit(event: SyntheticEvent) {
   
    if(isPending === 'pending'){
      event.preventDefault();
      return
    } 
    setPending('pending');
  }
  return (
    <main className="h-full">
      <Container>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl  font-bold"> Create Invoices</h1>
      </div>
      <Form action={createAction} onSubmit={handleOnSubmit} className="grid gap-4 max-w-xs">
        <div>
          <Label htmlFor="name" className="block font-semibold text-sm mb-2">
            Billing Name
          </Label>
          <Input id="name" name="name" type="text" />
        </div>
        <div>
          <Label htmlFor="email" className="block font-semibold text-sm mb-2">
            Billing Email
          </Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="value" className="block font-semibold text-sm mb-2">
            Value
          </Label>
          <Input id="value" name="value" type="text" />
        </div>
        <div>
          <Label
            htmlFor="description"
            className="block font-semibold text-sm mb-2"
          >
            Description
          </Label>
          <Textarea id="description" name="description"></Textarea>
        </div>
      <SubmitButton/>
      </Form>
      </Container>
    </main>
  );
}
