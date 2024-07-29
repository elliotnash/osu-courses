export const strongPasswordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export const osuEmailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@oregonstate\.edu$/;

export const usPhoneRegex =
  /^(\+0?1)?\s?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/;

export const hashAlgo = {
  algorithm: 'argon2id' as const,
  memoryCost: 19456 as const,
  timeCost: 2 as const,
};

export const verificationCodeLength = 6;
