import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingFlow } from './BookingFlow';
afterEach(()=>vi.restoreAllMocks());
describe('BookingFlow login',()=>{it('moves to OTP entry after a successful mobile submission',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({message:'OTP sent'})}));render(<BookingFlow/>);fireEvent.change(screen.getByLabelText('Mobile number'),{target:{value:'9876543210'}});fireEvent.click(screen.getByRole('button',{name:'Continue'}));expect(await screen.findByLabelText('Enter OTP')).toBeInTheDocument();});it('renders server validation feedback for a failed login',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,json:async()=>({error:'Mobile number must contain exactly 10 digits.'})}));render(<BookingFlow/>);fireEvent.change(screen.getByLabelText('Mobile number'),{target:{value:'9876543210'}});fireEvent.click(screen.getByRole('button',{name:'Continue'}));await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('10 digits'));});});
