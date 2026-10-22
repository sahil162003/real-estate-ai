
export function isProfileComplete(user) {
  const phone = String(user?.phoneNumber ?? "").trim();
  const address = String(user?.address ?? "").trim();

  const validIndianPhone = /^[6-9]\d{9}$/.test(phone);

  return validIndianPhone && address.length > 0 && address.length <= 255;
}
