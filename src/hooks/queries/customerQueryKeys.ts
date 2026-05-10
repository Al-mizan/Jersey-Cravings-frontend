export const customerProfileKeys = {
    all: ["customer", "profile"] as const,
    me: () => [...customerProfileKeys.all, "me"] as const,
};
