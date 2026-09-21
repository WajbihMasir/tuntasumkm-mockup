import { decideOrder } from '../lib/workflowOperations';

beforeAll(() => {
  if (!global.crypto) global.crypto = {};
  if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = () => `test-${Math.random().toString(16).slice(2)}`;
  }
});

const baseState = (orderOverrides = {}, productOverrides = {}) => ({
  settings: { owner: 'Rina' },
  products: [
    {
      id: 'p1',
      name: 'Tote Bag Everyday',
      variant: 'Sage',
      price: 75000,
      stock: 42,
      ...productOverrides,
    },
  ],
  chats: [{ id: 'chat-1', order: 'T-2001', status: 'Perlu persetujuan' }],
  flows: {},
  activity: [],
  orders: [
    {
      id: 'T-2001',
      product: 'p1',
      qty: 2,
      price: 75000,
      shipping: 18000,
      city: 'Bandung',
      service: 'manual',
      shippingNote: 'Tarif manual',
      name: 'Nadia',
      address: 'Jalan Mawar No 10',
      status: 'Menunggu persetujuan',
      createdAt: new Date().toISOString(),
      version: 1,
      events: [],
      ...orderOverrides,
    },
  ],
});

describe('workflowOperations decideOrder idempotence', () => {
  test('approve repeated call is idempotent and does not decrement stock twice', () => {
    const first = decideOrder(baseState(), 'T-2001', 'Diproses');
    expect(first.result.ok).toBe(true);
    expect(first.state.orders[0].status).toBe('Diproses');
    expect(first.state.products[0].stock).toBe(40);

    const second = decideOrder(first.state, 'T-2001', 'Diproses');
    expect(second.result.ok).toBe(true);
    expect(second.result.unchanged).toBe(true);
    expect(second.state.orders[0].status).toBe('Diproses');
    expect(second.state.products[0].stock).toBe(40);
  });

  test('complete repeated call is idempotent and keeps completed status', () => {
    const approved = decideOrder(baseState(), 'T-2001', 'Diproses');
    const firstComplete = decideOrder(approved.state, 'T-2001', 'Selesai');
    expect(firstComplete.result.ok).toBe(true);
    expect(firstComplete.state.orders[0].status).toBe('Selesai');

    const secondComplete = decideOrder(firstComplete.state, 'T-2001', 'Selesai');
    expect(secondComplete.result.ok).toBe(true);
    expect(secondComplete.result.unchanged).toBe(true);
    expect(secondComplete.state.orders[0].status).toBe('Selesai');
    expect(secondComplete.state.products[0].stock).toBe(40);
  });

  test('price drift blocks approval and keeps stock/status unchanged', () => {
    const drift = decideOrder(
      baseState({ price: 75000 }, { price: 90000, stock: 42 }),
      'T-2001',
      'Diproses'
    );

    expect(drift.result.ok).toBe(false);
    expect(drift.result.message.toLowerCase()).toContain('harga katalog berubah');
    expect(drift.state.orders[0].status).toBe('Menunggu persetujuan');
    expect(drift.state.products[0].stock).toBe(42);
  });
});
