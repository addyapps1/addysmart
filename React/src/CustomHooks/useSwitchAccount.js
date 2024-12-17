function useSwitchAccount() {
  const ranges = [5, 10, 15, 20, 25, 31];
  const currentDay = new Date().getDate();
  return ranges.findIndex((day) => currentDay <= day) + 1;
}

export default useSwitchAccount;
