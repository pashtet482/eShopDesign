export function formatPrice(price) {
  if (typeof price !== "number") price = Number(price);
  if (isNaN(price)) return "";
  return price.toLocaleString("ru-RU");
}
