import React, { useState } from 'react';

type PaymentMethod = 'card' | 'upi';

interface PaymentStepProps {
  onPaid: (method: PaymentMethod) => void;
}

/** Renders dummy payment options and exactly two-second processing. */
export function PaymentStep({ onPaid }: PaymentStepProps): JSX.Element {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);

  function pay(): void {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      onPaid(method);
    }, 2000);
  }

  if (processing) {
    return <div role="status">Processing Payment...</div>;
  }

  return (
    <section className="mt-8 space-y-4" aria-labelledby="payment-heading">
      <h2 id="payment-heading" className="font-display text-3xl font-bold">
        Payment
      </h2>
      <label className="block">
        <input
          type="radio"
          name="payment-method"
          checked={method === 'card'}
          onChange={() => setMethod('card')}
        />
        Card
      </label>
      <label className="block">
        <input
          type="radio"
          name="payment-method"
          checked={method === 'upi'}
          onChange={() => setMethod('upi')}
        />
        UPI
      </label>
      {method === 'card' ? (
        <div className="space-y-3">
          <label className="block">
            Card Number
            <input className="ml-2 rounded border border-stone-300" />
          </label>
          <label className="block">
            Expiry Date
            <input className="ml-2 rounded border border-stone-300" />
          </label>
          <label className="block">
            CVV
            <input className="ml-2 rounded border border-stone-300" />
          </label>
        </div>
      ) : (
        <label className="block">
          UPI ID
          <input className="ml-2 rounded border border-stone-300" placeholder="user@upi" />
        </label>
      )}
      <button
        type="button"
        className="w-full rounded-xl bg-cinema-500 p-3 font-bold text-white"
        onClick={pay}
      >
        Pay
      </button>
    </section>
  );
}
