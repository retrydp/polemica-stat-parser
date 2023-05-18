class GameStatistics {
  constructor(url) {
    this.url = url;
    this.players = [];
  }

  async fetchData() {
    try {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Failed to fetch game statistics');
      }

      const source = await response.text();
      const capture = source.match(/:game-data='(?<json>.+)'/);
      if (!capture) {
        throw new Error('Failed to extract game data from response');
      }

      const { json } = capture.groups;
      this.players = JSON.parse(json).players;
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  getPlayersByRole(role) {
    return this.players.filter((player) => player.role.type === role);
  }

  getPlayer(role) {
    const players = this.getPlayersByRole(role);
    const player = players.length > 0 ? players[0] : null;
    return player ? [player.tablePosition, player.username] : [];
  }

  getGroup(group) {
    return this.getPlayersByRole(group)
      .map((player) => [player.tablePosition, player.username])
      .sort((a, b) => a[0] - b[0]);
  }

  getMafiaList() {
    const mafia = this.getGroup('mafia');
    return mafia
      .map(([tablePosition, username]) => `${tablePosition} ${username}`)
      .join(', ');
  }

  printGameStatistics() {
    const godfather = this.getPlayer('godfather');
    const sheriff = this.getPlayer('sheriff');
    const mafiaList = this.getMafiaList();

    const output = `Mafia: ${mafiaList}, Godfather: ${godfather.join(
      ' '
    )}, Sheriff: ${sheriff.join(' ')}`;
    console.warn(output);
  }
}

async function getJson() {
  const gameStats = new GameStatistics(
    'https://polemicagames.kz/game-statistics/182516'
  );
  await gameStats.fetchData();
  gameStats.printGameStatistics();
}

getJson();
