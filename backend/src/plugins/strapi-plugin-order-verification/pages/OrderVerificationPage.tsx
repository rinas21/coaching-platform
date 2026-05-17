import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Grid, TextInput, Alert, Badge, Typography } from '@strapi/design-system';
import { Check } from '@strapi/icons';

const ADMIN_ORDERS_GENERIC = 'Something went wrong. Please refresh and try again.';
const ADMIN_MARK_PAID_GENERIC = 'We could not update that order. Please try again in a moment.';

function formatMoney(cents, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: String(currency || 'LKR').toUpperCase(),
  }).format((Number(cents) || 0) / 100);
}

function formatAdminDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusHeading(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'PAID') return 'Payment verified';
  if (s === 'PENDING_REVIEW') return 'Awaiting verification';
  if (s === 'PENDING_PAYMENT') return 'Awaiting payment';
  return status || '—';
}

function orderPriority(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'PAID') return 0;
  if (s === 'PENDING_REVIEW') return 1;
  if (s === 'PENDING_PAYMENT') return 2;
  return 3;
}

function AdminOrderLineItems({ snapshot, orderCurrency }) {
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  if (items.length === 0) return null;
  const cur = String(snapshot?.currency || orderCurrency || 'LKR').toUpperCase();
  const sub = snapshot?.subtotal_cents;
  const ship = snapshot?.shipping_cents;

  return (
    <Card style={{ marginTop: '1rem', padding: '1rem' }}>
      <Flex direction="column" gap={2}>
        <Typography variant="sigma" style={{ color: '#E88D5F', fontSize: '0.75rem', fontWeight: 'bold' }}>
          ORDER ITEMS
        </Typography>
        <Flex direction="column" gap={1}>
          {items.map((it, idx) => (
            <Flex key={`${it.name}-${idx}`} justifyContent="space-between">
              <Typography>
                {it.name || 'Item'}
                {it.quantity != null && it.quantity > 1 ? ` × ${it.quantity}` : ''}
              </Typography>
              <Typography>{formatMoney(Number(it.lineTotalCents) || 0, cur)}</Typography>
            </Flex>
          ))}
        </Flex>
        {typeof sub === 'number' ? (
          <Flex justifyContent="space-between" style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            <Typography>Subtotal</Typography>
            <Typography>{formatMoney(sub, cur)}</Typography>
          </Flex>
        ) : null}
        {typeof ship === 'number' && ship > 0 ? (
          <Flex justifyContent="space-between" style={{ fontSize: '0.875rem' }}>
            <Typography>Delivery / handling</Typography>
            <Typography>{formatMoney(ship, cur)}</Typography>
          </Flex>
        ) : null}
      </Flex>
    </Card>
  );
}

export function OrderVerificationPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [confirmMeta, setConfirmMeta] = useState({});

  const getApiUrl = () => {
    return process.env.STRAPI_API_URL || 'http://127.0.0.1:1337';
  };

  const getBackendApiUrl = () => {
    const fromEnv = process.env.STRAPI_BACKEND_API_URL?.trim();
    if (fromEnv) return fromEnv;
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || '127.0.0.1';
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${host}:8000`;
    }
    return 'http://127.0.0.1:8000';
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getBackendApiUrl()}/admin/orders`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({})));
      if (!res.ok) {
        setError(ADMIN_ORDERS_GENERIC);
        setOrders([]);
        return;
      }
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to load orders:', e);
      setError(ADMIN_ORDERS_GENERIC);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const markPaid = async (order) => {
    setBusyOrderId(order.id);
    setError(null);
    try {
      const meta = confirmMeta[order.id] || { reference: '', notes: '' };
      const res = await fetch(`${getBackendApiUrl()}/admin/orders/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: order.id,
          orderCode: order.order_code,
          paymentReference: meta.reference.trim() || undefined,
          notes: meta.notes.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({})));
      if (!res.ok) {
        console.error('Failed to mark order as paid:', data);
        setError(ADMIN_MARK_PAID_GENERIC);
        return;
      }
      await loadOrders();
    } catch (e) {
      console.error('Error marking order paid:', e);
      setError(ADMIN_MARK_PAID_GENERIC);
    } finally {
      setBusyOrderId(null);
    }
  };

  const getSlipUrl = (orderId) => {
    return `${getBackendApiUrl()}/admin/orders/${orderId}/slip`;
  };

  const sortedOrders = [...orders].sort((left, right) => {
    const statusDelta = orderPriority(left.status) - orderPriority(right.status);
    if (statusDelta !== 0) return statusDelta;
    const leftTime = new Date(left.created_at || 0).getTime();
    const rightTime = new Date(right.created_at || 0).getTime();
    return rightTime - leftTime;
  });

  const approvedOrders = sortedOrders.filter((order) => String(order.status || '').toUpperCase() === 'PAID');
  const previousOrders = sortedOrders.filter((order) => String(order.status || '').toUpperCase() !== 'PAID');

  const renderOrderCard = (order) => {
    const meta = confirmMeta[order.id] || { reference: '', notes: '' };
    const isPaid = String(order.status || '').toUpperCase() === 'PAID';
    const verifiedLabel = formatAdminDate(order.payment_verified_at);

    return (
      <Card key={order.id} style={{ padding: '1.5rem' }}>
        <Stack spacing={4}>
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Badge size="small" variant={isPaid ? 'success' : 'warning'}>
                {statusHeading(order.status)}
              </Badge>
              <h3 style={{ margin: 0 }}>{order.order_code}</h3>
              <Typography size="small" textColor="neutral600">
                {order.customer_email} • {formatMoney(order.total_amount_cents, order.currency)}
              </Typography>
              <Typography size="small" textColor="neutral600">
                Placed {formatAdminDate(order.created_at)}
              </Typography>
            </Stack>
            <Button
              variant={isPaid ? 'secondary' : 'default'}
              onClick={() => window.open(getSlipUrl(order.id), '_blank')}
            >
              {order.slip_id ? 'View Uploaded Slip' : 'No Slip Uploaded'}
            </Button>
          </Flex>

          <AdminOrderLineItems
            snapshot={order.items_snapshot ?? undefined}
            orderCurrency={order.currency}
          />

          {(order.slip_payment_reference || order.slip_notes) && (
            <Card style={{ padding: '1rem', backgroundColor: '#FEF3E6' }}>
              <Stack spacing={2}>
                <Typography variant="sigma" style={{ color: '#E88D5F', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  CUSTOMER SLIP DETAILS
                </Typography>
                {order.slip_payment_reference ? (
                  <Typography>
                    <strong>Reference:</strong> {order.slip_payment_reference}
                  </Typography>
                ) : null}
                {order.slip_notes ? (
                  <Typography>
                    <strong>Note:</strong> {order.slip_notes}
                  </Typography>
                ) : null}
              </Stack>
            </Card>
          )}

          {order.ship_line1 && (
            <Card style={{ padding: '1rem' }}>
              <Stack spacing={2}>
                <Typography variant="sigma" style={{ color: '#E88D5F', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  SHIP TO
                </Typography>
                <Typography style={{ fontWeight: 'bold' }}>{order.ship_full_name}</Typography>
                <Typography>{order.ship_phone}</Typography>
                <Typography>
                  {order.ship_line1}
                  {order.ship_line2 ? <>, {order.ship_line2}</> : null}
                  <br />
                  {order.ship_city}
                  {order.ship_region ? `, ${order.ship_region}` : ''} {order.ship_postal || ''}
                  <br />
                  {order.ship_country}
                </Typography>
              </Stack>
            </Card>
          )}

          {isPaid ? (
            <Alert title="Complete" variant="success">
              This order is complete. All details above stay on file for your records.
              {verifiedLabel ? ` Verified ${verifiedLabel}.` : ''}
            </Alert>
          ) : (
            <Stack spacing={3}>
              <Grid gap={3} gridCols={2}>
                <TextInput
                  placeholder="Payment reference"
                  value={meta.reference}
                  onChange={(e) =>
                    setConfirmMeta((prev) => ({
                      ...prev,
                      [order.id]: { ...meta, reference: e.target.value },
                    }))
                  }
                />
                <TextInput
                  placeholder="Notes"
                  value={meta.notes}
                  onChange={(e) =>
                    setConfirmMeta((prev) => ({
                      ...prev,
                      [order.id]: { ...meta, notes: e.target.value },
                    }))
                  }
                />
              </Grid>
              <Button
                startIcon={<Check />}
                loading={busyOrderId === order.id}
                onClick={() => markPaid(order)}
              >
                {busyOrderId === order.id ? 'Confirming...' : 'Mark payment verified (complete order)'}
              </Button>
            </Stack>
          )}
        </Stack>
      </Card>
    );
  };

  return (
    <Box padding={8}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <h1 style={{ margin: 0 }}>Order Verification Portal</h1>
          <Typography>Review uploaded slips and confirm payments.</Typography>
        </Flex>

        {error && (
          <Alert title="Error" variant="danger">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box padding={4} background="neutral100" hasRadius>
            <Typography>Loading orders...</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Box padding={4} background="neutral100" hasRadius>
            <Typography>No orders to show yet.</Typography>
          </Box>
        ) : (
          <Flex direction="column" gap={5}>
            <Card style={{ padding: '1rem' }}>
              <Flex direction="column" gap={1}>
                <h2 style={{ margin: 0 }}>Approved orders</h2>
                <Typography textColor="neutral600">Orders already marked as paid and verified.</Typography>
              </Flex>
            </Card>
            <Flex direction="column" gap={4}>{approvedOrders.map(renderOrderCard)}</Flex>

            <Card style={{ padding: '1rem' }}>
              <Flex direction="column" gap={1}>
                <h2 style={{ margin: 0 }}>Previous orders</h2>
                <Typography textColor="neutral600">Orders still waiting for review or payment confirmation.</Typography>
              </Flex>
            </Card>
            <Flex direction="column" gap={4}>{previousOrders.map(renderOrderCard)}</Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export default OrderVerificationPage;
