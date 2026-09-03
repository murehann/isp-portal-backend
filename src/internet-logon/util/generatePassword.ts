import { randomInt } from 'crypto';

export function generatePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '1234567890';
  const special = '_@$.-';

  const allCharacters = uppercase + lowercase + numbers + special;

  const password = [
    uppercase[randomInt(uppercase.length)],
    lowercase[randomInt(lowercase.length)],
    numbers[randomInt(numbers.length)],
    special[randomInt(special.length)],
  ];

  for (let i = 0; i < 4; i++) {
    password.push(allCharacters[randomInt(allCharacters.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}
