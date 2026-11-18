// ============================================================
// EAFC 26 STYLE — TOP 500 FOOTBALL PLAYER DATABASE
// Stats: pace, shooting, passing, dribbling, defending, physical
// ============================================================

const clamp = (v) => Math.max(40, Math.min(99, Math.round(v)));

const genStats = (ovr, pos, b = {}) => {
  const r = () => Math.floor(Math.random() * 5) - 2;
  const base = { pace: ovr + r(), shooting: ovr + r(), passing: ovr + r(), dribbling: ovr + r(), defending: ovr - 8 + r(), physical: ovr + r() };
  if (pos === 'FW') { base.shooting += 6; base.pace += 3; base.dribbling += 3; base.defending -= 14; }
  else if (pos === 'MF') { base.passing += 5; base.dribbling += 2; base.defending += 3; base.shooting -= 3; }
  else if (pos === 'DF') { base.defending += 20; base.physical += 4; base.shooting -= 12; base.pace -= 1; }
  else if (pos === 'GK') { base.defending += 22; base.physical += 3; base.pace -= 12; base.shooting -= 22; base.dribbling -= 18; }
  Object.keys(b).forEach(k => base[k] += b[k]);
  Object.keys(base).forEach(k => base[k] = clamp(base[k]));
  return base;
};

let uid = 0;
const P = (name, pos, ovr, nat, club, b) => {
  const s = genStats(ovr, pos, b || {});
  return { id: ++uid, name, position: pos, overall: ovr, nationality: nat, club, ...s, form: +(0.88 + Math.random() * 0.24).toFixed(2), basePrice: Math.round((ovr - 60) * 1.5 + 5) };
};

// ===== Name pools for procedural generation =====
const FIRST_NAMES = {
  BR: ['Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Vitor', 'Bruno', 'Pedro', 'André', 'Caio', 'Diego', 'Thiago', 'João', 'Felipe', 'Gustavo', 'Henrique', 'Igor', 'Luan', 'Marcos', 'Nicolas', 'Renan'],
  AR: ['Mateo', 'Thiago', 'Santiago', 'Nicolás', 'Facundo', 'Lautaro', 'Valentín', 'Emiliano', 'Franco', 'Gonzalo', 'Tomás', 'Agustín', 'Martín', 'Julián', 'Federico', 'Rodrigo', 'Joaquín', 'Alejandro', 'Ezequiel', 'Marcos'],
  ES: ['Pablo', 'Alejandro', 'Adrián', 'Sergio', 'Diego', 'Álvaro', 'Iñigo', 'Mikel', 'Ander', 'Dani', 'Ferrán', 'Jordi', 'Marc', 'Iker', 'Aitor', 'Unai', 'Oier', 'Xavi', 'Raúl', 'Isco'],
  EN: ['James', 'Oliver', 'Harry', 'Jack', 'Charlie', 'George', 'Thomas', 'William', 'Henry', 'Oscar', 'Samuel', 'Daniel', 'Max', 'Ben', 'Lewis', 'Owen', 'Ryan', 'Nathan', 'Callum', 'Finley'],
  FR: ['Antoine', 'Hugo', 'Lucas', 'Théo', 'Raphaël', 'Louis', 'Jules', 'Nathan', 'Mathis', 'Enzo', 'Adrien', 'Maxime', 'Kylian', 'Ousmane', 'Youssef', 'Moussa', 'Ibrahim', 'Rayan', 'Aurélien', 'Mattéo'],
  DE: ['Lukas', 'Florian', 'Maximilian', 'Leon', 'Felix', 'Jonas', 'Niklas', 'Tim', 'Jan', 'Kai', 'Timo', 'Marcel', 'Kevin', 'Robin', 'Patrick', 'Sven', 'Tobias', 'Julian', 'Luca', 'Paul'],
  IT: ['Marco', 'Alessandro', 'Lorenzo', 'Andrea', 'Matteo', 'Giacomo', 'Luca', 'Davide', 'Simone', 'Francesco', 'Federico', 'Gianluca', 'Roberto', 'Niccolò', 'Tommaso', 'Riccardo', 'Giuseppe', 'Filippo', 'Enrico', 'Paolo'],
  PT: ['Diogo', 'Gonçalo', 'Bernardo', 'João', 'Rúben', 'Nuno', 'Pedro', 'André', 'Fábio', 'Ricardo', 'Tiago', 'Francisco', 'Rafael', 'Miguel', 'Hugo', 'Tomás', 'Afonso', 'Duarte', 'David', 'Samuel'],
  NL: ['Daan', 'Sem', 'Luca', 'Finn', 'Jesse', 'Max', 'Thomas', 'Lars', 'Milan', 'Jordy', 'Mats', 'Rick', 'Stijn', 'Wesley', 'Quincy', 'Denzel', 'Memphis', 'Stefan', 'Cody', 'Owen'],
};
const LAST_NAMES = {
  BR: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Ribeiro', 'Barbosa', 'Martins', 'Araújo', 'Carvalho', 'Rocha', 'Mendes', 'Moreira', 'Nunes', 'Vieira', 'Gomes'],
  AR: ['González', 'Rodríguez', 'López', 'Martínez', 'García', 'Fernández', 'Pérez', 'Gutiérrez', 'Díaz', 'Sánchez', 'Romero', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Moreno', 'Vázquez', 'Acosta', 'Medina'],
  ES: ['García', 'López', 'Martínez', 'Hernández', 'Ruiz', 'Moreno', 'Torres', 'Romero', 'Alonso', 'Navarro', 'Gil', 'Molina', 'Blanco', 'Castro', 'Ortiz', 'Serrano', 'Delgado', 'Vega', 'Ramos', 'Suárez'],
  EN: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Wilson', 'Taylor', 'Davies', 'Evans', 'Thomas', 'Walker', 'Roberts', 'Wright', 'Turner', 'Hall', 'Green', 'Baker', 'Hill', 'Clark', 'Moore'],
  FR: ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Laurent', 'Simon', 'Michel', 'Lefèvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard', 'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau'],
  DE: ['Müller', 'Schmidt', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Wolf', 'Klein', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hartmann', 'Lange'],
  IT: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti'],
  PT: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Marques', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira'],
  NL: ['De Jong', 'Van Dijk', 'Bakker', 'Visser', 'Smit', 'Meijer', 'De Boer', 'Peters', 'Mulder', 'De Groot', 'Bos', 'Vos', 'Jansen', 'Hendriks', 'Van den Berg', 'Dekker', 'Vermeer', 'Schouten', 'Kuipers', 'Brouwer'],
};
const NATS = ['BR', 'AR', 'ES', 'EN', 'FR', 'DE', 'IT', 'PT', 'NL'];
const NAT_FLAGS = { BR: '🇧🇷', AR: '🇦🇷', ES: '🇪🇸', EN: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹', PT: '🇵🇹', NL: '🇳🇱' };
const CLUBS_BY_LEAGUE = {
  'Premier League': ['Arsenal', 'Chelsea', 'Man City', 'Man United', 'Liverpool', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham', 'Brentford', 'Crystal Palace', 'Fulham', 'Bournemouth', 'Wolves', 'Everton', 'Nottingham Forest', 'Leicester', 'Ipswich', 'Southampton'],
  'La Liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Real Sociedad', 'Athletic Bilbao', 'Villarreal', 'Real Betis', 'Sevilla', 'Valencia', 'Celta Vigo', 'Girona', 'Getafe', 'Osasuna', 'Espanyol', 'Rayo Vallecano'],
  'Bundesliga': ['Bayern Munich', 'B. Dortmund', 'B. Leverkusen', 'RB Leipzig', 'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg', 'Hoffenheim', 'Stuttgart', 'Union Berlin', 'M. Gladbach', 'Werder Bremen', 'Mainz', 'Augsburg'],
  'Serie A': ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino', 'Udinese', 'Monza', 'Cagliari', 'Genoa', 'Como'],
  'Ligue 1': ['PSG', 'AS Monaco', 'Lyon', 'Marseille', 'Lille', 'Nice', 'Lens', 'Rennes', 'Strasbourg', 'Toulouse', 'Nantes', 'Montpellier', 'Reims', 'Le Havre', 'Brest'],
};
const LEAGUES = Object.keys(CLUBS_BY_LEAGUE);

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateName = (natCode) => {
  const fn = FIRST_NAMES[natCode] || FIRST_NAMES.EN;
  const ln = LAST_NAMES[natCode] || LAST_NAMES.EN;
  return pickRandom(fn) + ' ' + pickRandom(ln);
};

const usedNames = new Set();
const uniqueName = (natCode) => {
  let name;
  let attempts = 0;
  do { name = generateName(natCode); attempts++; } while (usedNames.has(name) && attempts < 50);
  usedNames.add(name);
  return name;
};

// ============================================================
// NAMED PLAYER DATABASE (Top ~200 real players)
// ============================================================
export const createPlayerDatabase = () => {
  uid = 0;
  usedNames.clear();
  const named = [
    // ====== FORWARDS ======
    P('Mbappé', 'FW', 92, '🇫🇷', 'Real Madrid', { pace: 9, shooting: 8 }),
    P('Haaland', 'FW', 91, '🇳🇴', 'Man City', { shooting: 7, physical: 7 }),
    P('Kane', 'FW', 92, '🇬🇧', 'Bayern Munich', { shooting: 9, passing: 5 }),
    P('Vinicius Jr', 'FW', 90, '🇧🇷', 'Real Madrid', { pace: 7, dribbling: 6 }),
    P('Olise', 'FW', 90, '🇫🇷', 'Bayern Munich', { dribbling: 6, shooting: 4 }),
    P('Luis Diaz', 'FW', 89, '🇨🇴', 'Liverpool', { pace: 5, dribbling: 4 }),
    P('Raphinha', 'FW', 88, '🇧🇷', 'Barcelona', { shooting: 4, dribbling: 4, pace: 3 }),
    P('Lautaro', 'FW', 88, '🇦🇷', 'Inter Milan', { shooting: 5, physical: 3 }),
    P('Cherki', 'FW', 88, '🇫🇷', 'Lyon', { dribbling: 7, shooting: 4 }),
    P('Kvaratskhelia', 'FW', 87, '🇬🇪', 'PSG', { dribbling: 7, pace: 4 }),
    P('Ekitike', 'FW', 86, '🇫🇷', 'Eintracht Frankfurt', { pace: 5, shooting: 4 }),
    P('Dembele', 'FW', 86, '🇫🇷', 'PSG', { pace: 6, dribbling: 5 }),
    P('Mbeumo', 'FW', 86, '🇨🇲', 'Brentford', { shooting: 5, pace: 3 }),
    P('Doku', 'FW', 85, '🇧🇪', 'Man City', { pace: 7, dribbling: 6 }),
    P('Alvarez', 'FW', 86, '🇦🇷', 'Atletico Madrid', { shooting: 4, physical: 3 }),
    P('Thuram', 'FW', 85, '🇫🇷', 'Inter Milan', { pace: 4, physical: 4 }),
    P('Greenwood', 'FW', 86, '🇬🇧', 'Marseille', { shooting: 5, pace: 3 }),
    P('Nico Williams', 'FW', 85, '🇪🇸', 'Athletic Bilbao', { pace: 6, dribbling: 5 }),
    P('Foden', 'FW', 85, '🇬🇧', 'Man City', { dribbling: 5, shooting: 4, passing: 4 }),
    P('Leao', 'FW', 85, '🇵🇹', 'AC Milan', { pace: 7, dribbling: 5 }),
    P('Osimhen', 'FW', 85, '🇳🇬', 'Napoli', { pace: 5, shooting: 5, physical: 4 }),
    P('Gyokeres', 'FW', 85, '🇸🇪', 'Man United', { shooting: 6, physical: 4 }),
    P('Barcola', 'FW', 85, '🇫🇷', 'PSG', { pace: 6, dribbling: 4 }),
    P('Saka', 'FW', 85, '🇬🇧', 'Arsenal', { dribbling: 5, pace: 4 }),
    P('Cole Palmer', 'FW', 85, '🇬🇧', 'Chelsea', { shooting: 5, passing: 4 }),
    P('Salah', 'FW', 85, '🇪🇬', 'Liverpool', { pace: 5, shooting: 5 }),
    P('Pulisic', 'FW', 84, '🇺🇸', 'AC Milan', { pace: 4, shooting: 3, dribbling: 3 }),
    P('Doue', 'FW', 85, '🇫🇷', 'Barcelona', { dribbling: 5, pace: 4 }),
    P('Lewandowski', 'FW', 84, '🇵🇱', 'Barcelona', { shooting: 8, physical: 3, pace: -4 }),
    P('Rodrygo', 'FW', 84, '🇧🇷', 'Real Madrid', { dribbling: 4, pace: 4, shooting: 3 }),
    P('Guirassy', 'FW', 85, '🇬🇳', 'B. Dortmund', { shooting: 5, physical: 3 }),
    P('Isak', 'FW', 84, '🇸🇪', 'Newcastle', { shooting: 4, pace: 3 }),
    P('Son', 'FW', 84, '🇰🇷', 'Tottenham', { shooting: 5, pace: 4 }),
    P('Cristiano Ronaldo', 'FW', 84, '🇵🇹', 'Al Nassr', { shooting: 8, physical: 4 }),
    P('Messi', 'FW', 84, '🇦🇷', 'Inter Miami', { dribbling: 8, passing: 7, pace: -4 }),
    P('Watkins', 'FW', 83, '🇬🇧', 'Aston Villa', { shooting: 4, physical: 3 }),
    P('Havertz', 'FW', 83, '🇩🇪', 'Arsenal', { shooting: 3, physical: 3 }),
    P('Diogo Jota', 'FW', 83, '🇵🇹', 'Liverpool', { shooting: 4, pace: 3 }),
    P('Gakpo', 'FW', 83, '🇳🇱', 'Liverpool', { pace: 3, shooting: 3 }),
    P('Estevao', 'FW', 83, '🇧🇷', 'Chelsea', { dribbling: 6, pace: 4 }),
    P('Martinelli', 'FW', 82, '🇧🇷', 'Arsenal', { pace: 5, dribbling: 3 }),
    P('Neymar', 'FW', 81, '🇧🇷', 'Al Hilal', { dribbling: 9, passing: 5, pace: -3 }),
    P('Ferran Torres', 'FW', 80, '🇪🇸', 'Barcelona', { shooting: 3 }),
    P('Joao Felix', 'FW', 83, '🇵🇹', 'Chelsea', { dribbling: 5, shooting: 3 }),
    P('Richarlison', 'FW', 82, '🇧🇷', 'Tottenham', { shooting: 3, physical: 3 }),
    P('Rashford', 'FW', 82, '🇬🇧', 'Man United', { pace: 5, dribbling: 3 }),
    P('Cunha', 'FW', 83, '🇧🇷', 'Wolves', { dribbling: 4, shooting: 3 }),
    P('Lookman', 'FW', 83, '🇳🇬', 'Atalanta', { pace: 4, dribbling: 4 }),
    P('Retegui', 'FW', 82, '🇦🇷', 'Atalanta', { shooting: 4, physical: 3 }),
    P('Dovbyk', 'FW', 83, '🇺🇦', 'Roma', { shooting: 5, physical: 4 }),
    P('Sane', 'FW', 82, '🇩🇪', 'Bayern Munich', { pace: 5, dribbling: 4 }),
    P('Nkunku', 'FW', 83, '🇫🇷', 'Chelsea', { shooting: 4, dribbling: 3 }),
    P('Vlahovic', 'FW', 83, '🇷🇸', 'Juventus', { shooting: 5, physical: 3 }),
    P('Lamine Yamal', 'FW', 89, '🇪🇸', 'Barcelona', { dribbling: 6, pace: 5 }),
    P('Endrick', 'FW', 80, '🇧🇷', 'Real Madrid', { shooting: 3, pace: 4 }),
    P('Chiesa', 'FW', 81, '🇮🇹', 'Liverpool', { pace: 4, dribbling: 3 }),
    P('Oyarzabal', 'FW', 82, '🇪🇸', 'Real Sociedad', { shooting: 3, passing: 3 }),
    P('Griezmann', 'FW', 83, '🇫🇷', 'Atletico Madrid', { shooting: 4, passing: 4, pace: -3 }),
    P('Morata', 'FW', 82, '🇪🇸', 'AC Milan', { shooting: 4, physical: 2 }),
    P('David', 'FW', 83, '🇨🇦', 'Lille', { shooting: 5, pace: 2 }),


    // ====== MIDFIELDERS ======
    P('Bruno Fernandes', 'MF', 90, '🇵🇹', 'Man United', { passing: 7, shooting: 5 }),
    P('Valverde', 'MF', 90, '🇺🇾', 'Real Madrid', { pace: 4, physical: 5, shooting: 3 }),
    P('Pedri', 'MF', 90, '🇪🇸', 'Barcelona', { passing: 7, dribbling: 5 }),
    P('Vitinha', 'MF', 90, '🇵🇹', 'PSG', { passing: 6, dribbling: 4 }),
    P('Declan Rice', 'MF', 89, '🇬🇧', 'Arsenal', { defending: 6, physical: 4 }),
    P('Kimmich', 'MF', 89, '🇩🇪', 'Bayern Munich', { passing: 6, defending: 5 }),
    P('Szoboszlai', 'MF', 88, '🇭🇺', 'Liverpool', { shooting: 4, pace: 3 }),
    P('Tchouameni', 'MF', 88, '🇫🇷', 'Real Madrid', { defending: 5, physical: 4 }),
    P('Musiala', 'MF', 87, '🇩🇪', 'Bayern Munich', { dribbling: 7, passing: 3 }),
    P('Bruno Guimaraes', 'MF', 87, '🇧🇷', 'Newcastle', { passing: 4, defending: 3, physical: 3 }),
    P('Enzo Fernandez', 'MF', 87, '🇦🇷', 'Chelsea', { passing: 5, defending: 3 }),
    P('De Jong', 'MF', 87, '🇳🇱', 'Barcelona', { passing: 6, dribbling: 4 }),
    P('Joao Neves', 'MF', 87, '🇵🇹', 'PSG', { passing: 5, dribbling: 3, defending: 2 }),
    P('Zubimendi', 'MF', 87, '🇪🇸', 'Real Sociedad', { passing: 5, defending: 4 }),
    P('Caicedo', 'MF', 86, '🇪🇨', 'Chelsea', { defending: 5, physical: 5, pace: 3 }),
    P('McTominay', 'MF', 87, '🇬🇧', 'Napoli', { physical: 5, shooting: 4, defending: 3 }),
    P('Wirtz', 'MF', 86, '🇩🇪', 'B. Leverkusen', { dribbling: 5, passing: 4 }),
    P('Mac Allister', 'MF', 86, '🇦🇷', 'Liverpool', { passing: 4, defending: 3 }),
    P('Modric', 'MF', 86, '🇭🇷', 'Real Madrid', { passing: 7, dribbling: 4, pace: -5 }),
    P('Morgan Rogers', 'MF', 86, '🇬🇧', 'Aston Villa', { dribbling: 5, pace: 4 }),
    P('Tonali', 'MF', 86, '🇮🇹', 'Newcastle', { defending: 4, passing: 4, physical: 3 }),
    P('Bernardo Silva', 'MF', 85, '🇵🇹', 'Man City', { dribbling: 6, passing: 5 }),
    P('Fabian Ruiz', 'MF', 85, '🇪🇸', 'PSG', { passing: 5, physical: 3 }),
    P('De Bruyne', 'MF', 85, '🇧🇪', 'Man City', { passing: 9, shooting: 5, pace: -4 }),
    P('Barella', 'MF', 85, '🇮🇹', 'Inter Milan', { passing: 4, shooting: 3, physical: 3 }),
    P('Dani Olmo', 'MF', 84, '🇪🇸', 'Barcelona', { passing: 4, dribbling: 4 }),
    P('Calhanoglu', 'MF', 84, '🇹🇷', 'Inter Milan', { shooting: 5, passing: 4 }),
    P('Odegaard', 'MF', 84, '🇳🇴', 'Arsenal', { passing: 6, dribbling: 5 }),
    P('Kante', 'MF', 84, '🇫🇷', 'Al Ittihad', { defending: 6, physical: 5, pace: 2 }),
    P('Gravenberch', 'MF', 84, '🇳🇱', 'Liverpool', { dribbling: 4, passing: 3 }),
    P('Reijnders', 'MF', 84, '🇳🇱', 'AC Milan', { passing: 4, dribbling: 3 }),
    P('Tielemans', 'MF', 83, '🇧🇪', 'Aston Villa', { passing: 4, shooting: 3 }),
    P('Bellingham', 'MF', 89, '🇬🇧', 'Real Madrid', { shooting: 5, dribbling: 4, physical: 3 }),
    P('Xhaka', 'MF', 83, '🇨🇭', 'B. Leverkusen', { passing: 4, defending: 3 }),
    P('Camavinga', 'MF', 84, '🇫🇷', 'Real Madrid', { defending: 4, physical: 4 }),
    P('Gavi', 'MF', 83, '🇪🇸', 'Barcelona', { passing: 4, dribbling: 3 }),

    P('Kovacic', 'MF', 83, '🇭🇷', 'Man City', { passing: 4, dribbling: 3 }),
    P('Paqueta', 'MF', 83, '🇧🇷', 'West Ham', { dribbling: 4, shooting: 3 }),
    P('Ndidi', 'MF', 80, '🇳🇬', 'Leicester', { defending: 5, physical: 4 }),
    P('Ward-Prowse', 'MF', 81, '🇬🇧', 'West Ham', { passing: 5, shooting: 3 }),
    P('Locatelli', 'MF', 82, '🇮🇹', 'Juventus', { passing: 3, defending: 3 }),
    P('Lo Celso', 'MF', 82, '🇦🇷', 'Real Betis', { dribbling: 4, passing: 3 }),
    P('Aouar', 'MF', 80, '🇫🇷', 'Roma', { dribbling: 4, passing: 3 }),



    // ====== DEFENDERS ======
    P('Gabriel', 'DF', 90, '🇧🇷', 'Arsenal', { defending: 5, physical: 6 }),
    P('Pacho', 'DF', 88, '🇪🇨', 'PSG', { defending: 4, physical: 5 }),
    P('Saliba', 'DF', 89, '🇫🇷', 'Arsenal', { defending: 5, physical: 4 }),
    P('Bastoni', 'DF', 88, '🇮🇹', 'Inter Milan', { defending: 4, passing: 4 }),
    P('Hakimi', 'DF', 88, '🇲🇦', 'PSG', { pace: 7, dribbling: 3 }),
    P('Nuno Mendes', 'DF', 88, '🇵🇹', 'PSG', { pace: 5, defending: 3 }),
    P('Militao', 'DF', 88, '🇧🇷', 'Real Madrid', { defending: 4, pace: 4 }),
    P('Van Dijk', 'DF', 86, '🇳🇱', 'Liverpool', { defending: 6, physical: 6, pace: -3 }),
    P('Trent', 'DF', 86, '🇬🇧', 'Real Madrid', { passing: 8, pace: 3 }),
    P('Kounde', 'DF', 86, '🇫🇷', 'Barcelona', { pace: 5, defending: 3 }),
    P('Rudiger', 'DF', 85, '🇩🇪', 'Real Madrid', { defending: 4, physical: 5, pace: 3 }),
    P('Marquinhos', 'DF', 85, '🇧🇷', 'PSG', { defending: 5, physical: 3 }),
    P('Ruben Dias', 'DF', 85, '🇵🇹', 'Man City', { defending: 5, physical: 4 }),
    P('Theo Hernandez', 'DF', 85, '🇫🇷', 'AC Milan', { pace: 7, dribbling: 3 }),
    P('Araujo', 'DF', 83, '🇺🇾', 'Barcelona', { defending: 5, physical: 5, pace: 3 }),
    P('Konate', 'DF', 83, '🇫🇷', 'Liverpool', { pace: 4, defending: 4 }),
    P('Akanji', 'DF', 83, '🇨🇭', 'Man City', { defending: 4, pace: 2 }),
    P('Romero', 'DF', 84, '🇦🇷', 'Tottenham', { defending: 5, physical: 3 }),
    P('Frimpong', 'DF', 84, '🇳🇱', 'B. Leverkusen', { pace: 7, dribbling: 4 }),
    P('Gvardiol', 'DF', 84, '🇭🇷', 'Man City', { defending: 3, physical: 4 }),
    P('Timber', 'DF', 88, '🇳🇱', 'Arsenal', { pace: 4, defending: 4 }),
    P('Cancelo', 'DF', 84, '🇵🇹', 'Al Hilal', { dribbling: 5, passing: 5, pace: 3 }),
    P('Carvajal', 'DF', 84, '🇪🇸', 'Real Madrid', { defending: 4, pace: 3 }),
    P('Kim Min-Jae', 'DF', 82, '🇰🇷', 'Bayern Munich', { defending: 5, pace: 3 }),
    P('Dimarco', 'DF', 88, '🇮🇹', 'Inter Milan', { passing: 5, pace: 3 }),
    P('Lisandro Martinez', 'DF', 84, '🇦🇷', 'Man United', { defending: 5, physical: 4 }),
    P('Upamecano', 'DF', 85, '🇫🇷', 'Bayern Munich', { pace: 4, physical: 4 }),
    P('Pavard', 'DF', 80, '🇫🇷', 'Inter Milan', { defending: 3, passing: 3 }),
    P('Skriniar', 'DF', 80, '🇸🇰', 'PSG', { defending: 5, physical: 4 }),
    P('Laporte', 'DF', 83, '🇪🇸', 'Al Nassr', { passing: 4, defending: 4 }),
    P('Robertson', 'DF', 83, '🇬🇧', 'Liverpool', { pace: 4, passing: 4 }),
    P('White', 'DF', 83, '🇬🇧', 'Arsenal', { defending: 4, pace: 2 }),
    P('Davies', 'DF', 83, '🇨🇦', 'Bayern Munich', { pace: 7, dribbling: 3 }),
    P('Cucurella', 'DF', 82, '🇪🇸', 'Chelsea', { pace: 3, defending: 3 }),
    P('Todibo', 'DF', 82, '🇫🇷', 'West Ham', { defending: 3, physical: 3 }),
    P('Colwill', 'DF', 80, '🇬🇧', 'Chelsea', { defending: 3, pace: 2 }),
    P('Acuna', 'DF', 80, '🇦🇷', 'Sevilla', { pace: 3, physical: 3 }),
    P('Zinchenko', 'DF', 80, '🇺🇦', 'Arsenal', { passing: 5, dribbling: 3 }),
    P('Reece James', 'DF', 83, '🇬🇧', 'Chelsea', { pace: 3, defending: 3 }),
    P('Emerson', 'DF', 77, '🇧🇷', 'Tottenham', { defending: 3, physical: 2 }),
    P('Dalot', 'DF', 11, '🇵🇹', 'Man United', { pace: 3, dribbling: 2 }),
    P('Walker', 'DF', 80, '🇬🇧', 'AC Milan', { pace: 6, physical: 4, defending: 2 }),
    P('Cash', 'DF', 79, '🇵🇱', 'Aston Villa', { pace: 3, physical: 2 }),
    P('Mazraoui', 'DF', 82, '🇲🇦', 'Man United', { pace: 3, dribbling: 2 }),
    P('Tah', 'DF', 85, '🇩🇪', 'B. Leverkusen', { defending: 4, physical: 4 }),
    P('Calafat', 'DF', 76, '🇪🇸', 'Brighton', { defending: 2, pace: 2 }),


    // ====== GOALKEEPERS ======
    P('Courtois', 'GK', 90, '🇧🇪', 'Real Madrid'),
    P('Donnarumma', 'GK', 89, '🇮🇹', 'PSG'),
    P('Maignan', 'GK', 87, '🇫🇷', 'AC Milan'),
    P('Alisson', 'GK', 86, '🇧🇷', 'Liverpool'),
    P('Oblak', 'GK', 86, '🇸🇮', 'Atletico Madrid'),
    P('Ter Stegen', 'GK', 83, '🇩🇪', 'Barcelona'),
    P('Ederson', 'GK', 84, '🇧🇷', 'Al Ittihad'),
    P('Raya', 'GK', 87, '🇪🇸', 'Arsenal'),
    P('Neuer', 'GK', 83, '🇩🇪', 'Bayern Munich'),
    P('Onana', 'GK', 1, '🇨🇲', 'Man United'),
    P('Sommer', 'GK', 83, '🇨🇭', 'Inter Milan'),
    P('Szczesny', 'GK', 82, '🇵🇱', 'Barcelona'),
    P('De Gea', 'GK', 80, '🇪🇸', 'Fiorentina'),
    P('Diogo Costa', 'GK', 83, '🇵🇹', 'Porto'),
    P('Pickford', 'GK', 82, '🇬🇧', 'Everton'),
    P('Martinez', 'GK', 84, '🇦🇷', 'Aston Villa'),
    P('Casteels', 'GK', 82, '🇧🇪', 'Wolfsburg'),
    P('Navas', 'GK', 80, '🇨🇷', 'PSG'),
    P('Vicario', 'GK', 83, '🇮🇹', 'Tottenham'),
    P('Areola', 'GK', 80, '🇫🇷', 'West Ham'),
    P('Flekken', 'GK', 81, '🇳🇱', 'Brentford'),
    P('Neto', 'GK', 80, '🇧🇷', 'Chelsea'),
    P('Lafont', 'GK', 81, '🇫🇷', 'Nantes'),
    P('Pope', 'GK', 81, '🇬🇧', 'Newcastle'),
  ];


  // ============================================================
  // PROCEDURAL GENERATION — Fill to 500 players
  // ============================================================
  const needed = 500 - named.length;
  const posDistribution = { FW: 0.28, MF: 0.30, DF: 0.32, GK: 0.10 };
  const positions = ['FW', 'MF', 'DF', 'GK'];
  const ovrRanges = { FW: [74, 83], MF: [74, 83], DF: [74, 83], GK: [74, 81] };

  for (let i = 0; i < needed; i++) {
    const natCode = pickRandom(NATS);
    const flag = NAT_FLAGS[natCode];
    const name = uniqueName(natCode);

    // Distribute positions
    let pos;
    const roll = Math.random();
    if (roll < posDistribution.FW) pos = 'FW';
    else if (roll < posDistribution.FW + posDistribution.MF) pos = 'MF';
    else if (roll < posDistribution.FW + posDistribution.MF + posDistribution.DF) pos = 'DF';
    else pos = 'GK';

    const [minOvr, maxOvr] = ovrRanges[pos];
    const ovr = minOvr + Math.floor(Math.random() * (maxOvr - minOvr + 1));
    const league = pickRandom(LEAGUES);
    const club = pickRandom(CLUBS_BY_LEAGUE[league]);

    named.push(P(name, pos, ovr, flag, club));
  }

  return named;
};

export const POSITIONS = ['GK', 'DF', 'MF', 'FW'];
export const POSITION_LABELS = { GK: 'Goalkeeper', DF: 'Defender', MF: 'Midfielder', FW: 'Forward' };
export const POSITION_COLORS = { GK: '#f59e0b', DF: '#3b82f6', MF: '#10b981', FW: '#ef4444' };
export const STAT_KEYS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
