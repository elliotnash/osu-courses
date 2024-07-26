export const strongPasswordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export const osuEmailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@oregonstate\.edu$/;

export const usPhoneRegex =
  /^(\+0?1)?\s?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})$/;
