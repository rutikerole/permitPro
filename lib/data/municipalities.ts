import type { Municipality, FederalState } from '@/lib/assessment/types';

export const MUNICIPALITIES: Municipality[] = [
  // ── Baden-Württemberg — Stadtkreise ─────────────────────────────────────
  { id: 'stuttgart',           name: 'Stuttgart',              landkreis: 'Stadtkreis Stuttgart',         zip: '70173', hasBebaungsplan: true,  state: 'BW' },
  { id: 'karlsruhe',           name: 'Karlsruhe',              landkreis: 'Stadtkreis Karlsruhe',         zip: '76131', hasBebaungsplan: true,  state: 'BW' },
  { id: 'mannheim',            name: 'Mannheim',               landkreis: 'Stadtkreis Mannheim',          zip: '68159', hasBebaungsplan: true,  state: 'BW' },
  { id: 'freiburg',            name: 'Freiburg im Breisgau',   landkreis: 'Stadtkreis Freiburg',          zip: '79098', hasBebaungsplan: true,  state: 'BW' },
  { id: 'heidelberg',          name: 'Heidelberg',             landkreis: 'Stadtkreis Heidelberg',        zip: '69115', hasBebaungsplan: true,  state: 'BW' },
  { id: 'heilbronn',           name: 'Heilbronn',              landkreis: 'Stadtkreis Heilbronn',         zip: '74072', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ulm',                 name: 'Ulm',                    landkreis: 'Stadtkreis Ulm',               zip: '89073', hasBebaungsplan: true,  state: 'BW' },
  { id: 'pforzheim',           name: 'Pforzheim',              landkreis: 'Stadtkreis Pforzheim',         zip: '75172', hasBebaungsplan: true,  state: 'BW' },
  { id: 'baden-baden',         name: 'Baden-Baden',            landkreis: 'Stadtkreis Baden-Baden',       zip: '76530', hasBebaungsplan: true,  state: 'BW' },

  // ── Baden-Württemberg — Große Kreisstädte ────────────────────────────────
  { id: 'tuebingen',           name: 'Tübingen',               landkreis: 'Landkreis Tübingen',           zip: '72070', hasBebaungsplan: true,  state: 'BW' },
  { id: 'reutlingen',          name: 'Reutlingen',             landkreis: 'Landkreis Reutlingen',         zip: '72760', hasBebaungsplan: true,  state: 'BW' },
  { id: 'offenburg',           name: 'Offenburg',              landkreis: 'Ortenaukreis',                 zip: '77652', hasBebaungsplan: true,  state: 'BW' },
  { id: 'konstanz',            name: 'Konstanz',               landkreis: 'Landkreis Konstanz',           zip: '78462', hasBebaungsplan: true,  state: 'BW' },
  { id: 'esslingen',           name: 'Esslingen am Neckar',    landkreis: 'Landkreis Esslingen',          zip: '73728', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ludwigsburg',         name: 'Ludwigsburg',            landkreis: 'Landkreis Ludwigsburg',        zip: '71634', hasBebaungsplan: true,  state: 'BW' },
  { id: 'goeppingen',          name: 'Göppingen',              landkreis: 'Landkreis Göppingen',          zip: '73033', hasBebaungsplan: true,  state: 'BW' },
  { id: 'aalen',               name: 'Aalen',                  landkreis: 'Ostalbkreis',                  zip: '73430', hasBebaungsplan: true,  state: 'BW' },
  { id: 'schwaebisch-hall',    name: 'Schwäbisch Hall',        landkreis: 'Landkreis Schwäbisch Hall',    zip: '74523', hasBebaungsplan: true,  state: 'BW' },
  { id: 'biberach',            name: 'Biberach an der Riß',    landkreis: 'Landkreis Biberach',           zip: '88400', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ravensburg',          name: 'Ravensburg',             landkreis: 'Landkreis Ravensburg',         zip: '88212', hasBebaungsplan: true,  state: 'BW' },
  { id: 'friedrichshafen',     name: 'Friedrichshafen',        landkreis: 'Bodenseekreis',                zip: '88045', hasBebaungsplan: true,  state: 'BW' },
  { id: 'villingen',           name: 'Villingen-Schwenningen', landkreis: 'Schwarzwald-Baar-Kreis',       zip: '78048', hasBebaungsplan: true,  state: 'BW' },
  { id: 'waiblingen',          name: 'Waiblingen',             landkreis: 'Rems-Murr-Kreis',              zip: '71332', hasBebaungsplan: true,  state: 'BW' },
  { id: 'singen',              name: 'Singen',                 landkreis: 'Landkreis Konstanz',           zip: '78224', hasBebaungsplan: true,  state: 'BW' },
  { id: 'loerrach',            name: 'Lörrach',                landkreis: 'Landkreis Lörrach',            zip: '79539', hasBebaungsplan: true,  state: 'BW' },
  { id: 'bruchsal',            name: 'Bruchsal',               landkreis: 'Landkreis Karlsruhe',          zip: '76646', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ettlingen',           name: 'Ettlingen',              landkreis: 'Landkreis Karlsruhe',          zip: '76275', hasBebaungsplan: true,  state: 'BW' },
  { id: 'buehl',               name: 'Bühl',                   landkreis: 'Landkreis Rastatt',            zip: '77815', hasBebaungsplan: true,  state: 'BW' },
  { id: 'metzingen',           name: 'Metzingen',              landkreis: 'Landkreis Reutlingen',         zip: '72555', hasBebaungsplan: true,  state: 'BW' },
  { id: 'balingen',            name: 'Balingen',               landkreis: 'Zollernalbkreis',              zip: '72336', hasBebaungsplan: false, state: 'BW' },

  // ── Baden-Württemberg — Mittlere Gemeinden ───────────────────────────────
  { id: 'gernsbach',           name: 'Gernsbach',              landkreis: 'Landkreis Rastatt',            zip: '76593', hasBebaungsplan: false, state: 'BW' },
  { id: 'schorndorf',          name: 'Schorndorf',             landkreis: 'Rems-Murr-Kreis',              zip: '73614', hasBebaungsplan: true,  state: 'BW' },
  { id: 'neckarsulm',          name: 'Neckarsulm',             landkreis: 'Landkreis Heilbronn',          zip: '74172', hasBebaungsplan: true,  state: 'BW' },
  { id: 'sindelfingen',        name: 'Sindelfingen',           landkreis: 'Landkreis Böblingen',          zip: '71065', hasBebaungsplan: true,  state: 'BW' },
  { id: 'boeblingen',          name: 'Böblingen',              landkreis: 'Landkreis Böblingen',          zip: '71032', hasBebaungsplan: true,  state: 'BW' },
  { id: 'nagold',              name: 'Nagold',                 landkreis: 'Landkreis Calw',               zip: '72202', hasBebaungsplan: false, state: 'BW' },
  { id: 'leutkirch',           name: 'Leutkirch im Allgäu',   landkreis: 'Landkreis Ravensburg',         zip: '88299', hasBebaungsplan: false, state: 'BW' },
  { id: 'sinsheim',            name: 'Sinsheim',               landkreis: 'Rhein-Neckar-Kreis',           zip: '74889', hasBebaungsplan: true,  state: 'BW' },
  { id: 'weinheim',            name: 'Weinheim',               landkreis: 'Rhein-Neckar-Kreis',           zip: '69469', hasBebaungsplan: true,  state: 'BW' },
  { id: 'wiesloch',            name: 'Wiesloch',               landkreis: 'Rhein-Neckar-Kreis',           zip: '69168', hasBebaungsplan: true,  state: 'BW' },
  { id: 'rastatt',             name: 'Rastatt',                landkreis: 'Landkreis Rastatt',            zip: '76437', hasBebaungsplan: true,  state: 'BW' },
  { id: 'kehl',                name: 'Kehl',                   landkreis: 'Ortenaukreis',                 zip: '77694', hasBebaungsplan: true,  state: 'BW' },
  { id: 'schwaebisch-gmuend',  name: 'Schwäbisch Gmünd',       landkreis: 'Ostalbkreis',                  zip: '73525', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ellwangen',           name: 'Ellwangen',              landkreis: 'Ostalbkreis',                  zip: '73479', hasBebaungsplan: true,  state: 'BW' },
  { id: 'heidenheim',          name: 'Heidenheim an der Brenz',landkreis: 'Landkreis Heidenheim',         zip: '89518', hasBebaungsplan: true,  state: 'BW' },
  { id: 'tuttlingen',          name: 'Tuttlingen',             landkreis: 'Landkreis Tuttlingen',         zip: '78532', hasBebaungsplan: true,  state: 'BW' },
  { id: 'rottweil',            name: 'Rottweil',               landkreis: 'Landkreis Rottweil',           zip: '78628', hasBebaungsplan: true,  state: 'BW' },
  { id: 'sigmaringen',         name: 'Sigmaringen',            landkreis: 'Landkreis Sigmaringen',        zip: '72488', hasBebaungsplan: true,  state: 'BW' },
  { id: 'freudenstadt',        name: 'Freudenstadt',           landkreis: 'Landkreis Freudenstadt',       zip: '72250', hasBebaungsplan: true,  state: 'BW' },
  { id: 'calw',                name: 'Calw',                   landkreis: 'Landkreis Calw',               zip: '75365', hasBebaungsplan: true,  state: 'BW' },
  { id: 'waldshut-tiengen',    name: 'Waldshut-Tiengen',       landkreis: 'Landkreis Waldshut',           zip: '79761', hasBebaungsplan: true,  state: 'BW' },
  { id: 'ueberlingen',         name: 'Überlingen',             landkreis: 'Bodenseekreis',                zip: '88662', hasBebaungsplan: true,  state: 'BW' },
  { id: 'wangen',              name: 'Wangen im Allgäu',       landkreis: 'Landkreis Ravensburg',         zip: '88239', hasBebaungsplan: true,  state: 'BW' },
  { id: 'donaueschingen',      name: 'Donaueschingen',         landkreis: 'Schwarzwald-Baar-Kreis',       zip: '78166', hasBebaungsplan: true,  state: 'BW' },
  { id: 'emmendingen',         name: 'Emmendingen',            landkreis: 'Landkreis Emmendingen',        zip: '79312', hasBebaungsplan: true,  state: 'BW' },
  { id: 'rheinfelden',         name: 'Rheinfelden (Baden)',    landkreis: 'Landkreis Lörrach',            zip: '79618', hasBebaungsplan: true,  state: 'BW' },
  { id: 'nuertingen',          name: 'Nürtingen',              landkreis: 'Landkreis Esslingen',          zip: '72622', hasBebaungsplan: true,  state: 'BW' },
  { id: 'kirchheim',           name: 'Kirchheim unter Teck',   landkreis: 'Landkreis Esslingen',          zip: '73230', hasBebaungsplan: true,  state: 'BW' },
  { id: 'filderstadt',         name: 'Filderstadt',            landkreis: 'Landkreis Esslingen',          zip: '70794', hasBebaungsplan: true,  state: 'BW' },
  { id: 'leinfelden',          name: 'Leinfelden-Echterdingen',landkreis: 'Landkreis Esslingen',          zip: '70771', hasBebaungsplan: true,  state: 'BW' },
  { id: 'backnang',            name: 'Backnang',               landkreis: 'Rems-Murr-Kreis',              zip: '71522', hasBebaungsplan: true,  state: 'BW' },
  { id: 'winnenden',           name: 'Winnenden',              landkreis: 'Rems-Murr-Kreis',              zip: '71364', hasBebaungsplan: true,  state: 'BW' },
  { id: 'fellbach',            name: 'Fellbach',               landkreis: 'Rems-Murr-Kreis',              zip: '70736', hasBebaungsplan: true,  state: 'BW' },
  { id: 'weinstadt',           name: 'Weinstadt',              landkreis: 'Rems-Murr-Kreis',              zip: '71384', hasBebaungsplan: true,  state: 'BW' },
  { id: 'mosbach',             name: 'Mosbach',                landkreis: 'Neckar-Odenwald-Kreis',        zip: '74821', hasBebaungsplan: true,  state: 'BW' },
  { id: 'schwetzingen',        name: 'Schwetzingen',           landkreis: 'Rhein-Neckar-Kreis',           zip: '68723', hasBebaungsplan: true,  state: 'BW' },
  { id: 'hockenheim',          name: 'Hockenheim',             landkreis: 'Rhein-Neckar-Kreis',           zip: '68766', hasBebaungsplan: true,  state: 'BW' },
  { id: 'radolfzell',          name: 'Radolfzell am Bodensee', landkreis: 'Landkreis Konstanz',           zip: '78315', hasBebaungsplan: true,  state: 'BW' },
  { id: 'waldkirch',           name: 'Waldkirch',              landkreis: 'Landkreis Emmendingen',        zip: '79183', hasBebaungsplan: true,  state: 'BW' },
  { id: 'bad-saeckingen',      name: 'Bad Säckingen',          landkreis: 'Landkreis Waldshut',           zip: '79713', hasBebaungsplan: true,  state: 'BW' },
  { id: 'stockach',            name: 'Stockach',               landkreis: 'Landkreis Konstanz',           zip: '78333', hasBebaungsplan: false, state: 'BW' },
  { id: 'horb',                name: 'Horb am Neckar',         landkreis: 'Landkreis Freudenstadt',       zip: '72160', hasBebaungsplan: false, state: 'BW' },
  { id: 'pfullendorf',         name: 'Pfullendorf',            landkreis: 'Landkreis Sigmaringen',        zip: '88630', hasBebaungsplan: false, state: 'BW' },
  { id: 'bad-saulgau',         name: 'Bad Saulgau',            landkreis: 'Landkreis Sigmaringen',        zip: '88348', hasBebaungsplan: false, state: 'BW' },
  { id: 'giengen',             name: 'Giengen an der Brenz',   landkreis: 'Landkreis Heidenheim',         zip: '89537', hasBebaungsplan: false, state: 'BW' },
  { id: 'achern',              name: 'Achern',                 landkreis: 'Ortenaukreis',                 zip: '77855', hasBebaungsplan: false, state: 'BW' },
  { id: 'buchen',              name: 'Buchen (Odenwald)',       landkreis: 'Neckar-Odenwald-Kreis',        zip: '74722', hasBebaungsplan: false, state: 'BW' },

  // ── Bayern — Kreisfreie Städte ────────────────────────────────────────────
  { id: 'by-muenchen',         name: 'München',                landkreis: 'Kreisfreie Stadt München',     zip: '80331', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-nuernberg',        name: 'Nürnberg',               landkreis: 'Kreisfreie Stadt Nürnberg',    zip: '90402', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-augsburg',         name: 'Augsburg',               landkreis: 'Kreisfreie Stadt Augsburg',    zip: '86150', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-regensburg',       name: 'Regensburg',             landkreis: 'Kreisfreie Stadt Regensburg',  zip: '93047', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-ingolstadt',       name: 'Ingolstadt',             landkreis: 'Kreisfreie Stadt Ingolstadt',  zip: '85049', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-wuerzburg',        name: 'Würzburg',               landkreis: 'Kreisfreie Stadt Würzburg',    zip: '97070', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-fuerth',           name: 'Fürth',                  landkreis: 'Kreisfreie Stadt Fürth',       zip: '90762', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-erlangen',         name: 'Erlangen',               landkreis: 'Kreisfreie Stadt Erlangen',    zip: '91052', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-bamberg',          name: 'Bamberg',                landkreis: 'Kreisfreie Stadt Bamberg',     zip: '96047', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-bayreuth',         name: 'Bayreuth',               landkreis: 'Kreisfreie Stadt Bayreuth',    zip: '95444', hasBebaungsplan: true,  state: 'BY' },

  // ── Bayern — Große Kreisstädte ───────────────────────────────────────────
  { id: 'by-landshut',         name: 'Landshut',               landkreis: 'Kreisfreie Stadt Landshut',    zip: '84028', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-rosenheim',        name: 'Rosenheim',              landkreis: 'Kreisfreie Stadt Rosenheim',   zip: '83022', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-passau',           name: 'Passau',                 landkreis: 'Kreisfreie Stadt Passau',      zip: '94032', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-coburg',           name: 'Coburg',                 landkreis: 'Kreisfreie Stadt Coburg',      zip: '96450', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-hof',              name: 'Hof',                    landkreis: 'Kreisfreie Stadt Hof',         zip: '95028', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-ansbach',          name: 'Ansbach',                landkreis: 'Kreisfreie Stadt Ansbach',     zip: '91522', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-kempten',          name: 'Kempten (Allgäu)',       landkreis: 'Kreisfreie Stadt Kempten',     zip: '87435', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-kaufbeuren',       name: 'Kaufbeuren',             landkreis: 'Kreisfreie Stadt Kaufbeuren',  zip: '87600', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-memmingen',        name: 'Memmingen',              landkreis: 'Kreisfreie Stadt Memmingen',   zip: '87700', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-schweinfurt',      name: 'Schweinfurt',            landkreis: 'Kreisfreie Stadt Schweinfurt', zip: '97421', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-straubing',        name: 'Straubing',              landkreis: 'Kreisfreie Stadt Straubing',   zip: '94315', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-deggendorf',       name: 'Deggendorf',             landkreis: 'Landkreis Deggendorf',         zip: '94469', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-weilheim',         name: 'Weilheim i.OB',          landkreis: 'Landkreis Weilheim-Schongau', zip: '82362', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-traunstein',       name: 'Traunstein',             landkreis: 'Landkreis Traunstein',         zip: '83278', hasBebaungsplan: true,  state: 'BY' },
  { id: 'by-freising',         name: 'Freising',               landkreis: 'Landkreis Freising',           zip: '85354', hasBebaungsplan: true,  state: 'BY' },
];

export function searchMunicipalities(query: string, state?: FederalState | null, limit = 8): Municipality[] {
  const q = query.toLowerCase().trim();
  const filtered = state
    ? MUNICIPALITIES.filter((m) => m.state === state)
    : MUNICIPALITIES;
  if (!q) return filtered.slice(0, limit);
  return filtered.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.landkreis.toLowerCase().includes(q) ||
      m.zip.startsWith(q)
  ).slice(0, limit);
}
