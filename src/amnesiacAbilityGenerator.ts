export const generateAmnesiacAbilities = (): string[] => {
  const prefix = "Each night, ";

  const stepOne = [
    "select a player. You learn if they're ",
    "select a player. You learn if at least one of their neighbors is ",
    "select a player. You learn how many of their neighbors are ",
    "you learn if at least one of your living neighbors is ",
    "you learn how many of your living neighbors are ",
    "select two players. You learn if at least one of them is ",
    "select two players. You learn how many of them are ",
  ];

  const stepTwo = [
    "good.",
    "evil.",
    "a Townsfolk.",
    "an Outsider.",
    "a Minion.",
    "a Demon.",
    "drunk or poisoned.",
    "affected by a madness-related ability.",
  ];

  const results: string[] = [];

  const combinations = stepOne.flatMap((d) => stepTwo.map((v) => [d, v]));
  combinations.forEach((combo) => {
    results.push(prefix + combo[0] + combo[1]);
  });

  return results;
};
