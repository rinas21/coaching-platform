export const CART_KEY = "safespace_cart";

export type CartLine = {
  serviceId: string;
  name: string;
  description: string | null;
  priceCents: number;
  quantity: number;
};

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartLine =>
        row &&
        typeof row === "object" &&
        typeof (row as CartLine).serviceId === "string" &&
        typeof (row as CartLine).name === "string" &&
        typeof (row as CartLine).priceCents === "number" &&
        typeof (row as CartLine).quantity === "number"
    );
  } catch {
    return [];
  }
}

export function setCart(lines: CartLine[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent("safespace-cart-change"));
}

export function cartLineTotal(line: CartLine): number {
  return line.priceCents * line.quantity;
}

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + cartLineTotal(line), 0);
}

export function addToCart(line: Omit<CartLine, "quantity"> & { quantity?: number }): void {
  const qty = Math.max(1, line.quantity ?? 1);
  const cart = getCart();
  const idx = cart.findIndex((l) => l.serviceId === line.serviceId);
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: Math.min(99, cart[idx].quantity + qty) };
  } else {
    cart.push({
      serviceId: line.serviceId,
      name: line.name,
      description: line.description,
      priceCents: line.priceCents,
      quantity: qty,
    });
  }
  setCart(cart);
}

export function updateLineQuantity(serviceId: string, quantity: number): void {
  if (quantity < 1) {
    removeLine(serviceId);
    return;
  }
  const cart = getCart().map((l) =>
    l.serviceId === serviceId ? { ...l, quantity: Math.min(99, quantity) } : l
  );
  setCart(cart);
}

export function removeLine(serviceId: string): void {
  setCart(getCart().filter((l) => l.serviceId !== serviceId));
}

export function clearCart(): void {
  setCart([]);
}
