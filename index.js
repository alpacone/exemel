const fs = require('fs');
const path = require('path');
const { xml2js, js2xml } = require('xml-js');
const { flattie } = require('flattie');
const { nestie } = require('nestie');
const prettyHrtime = require('pretty-hrtime');
const { mkdir } = require('mk-dirs/sync');

mkdir('exemel');

const startAt = process.hrtime();

// Убираем лишние аргументы
const args = process.argv.slice(2);
console.log('Args:', args);

for (const filePath of args) {
  // Узнаём полный путь до файла
  console.log(filePath);

  // читаем файл и парсим его
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = xml2js(content, { alwaysChildren: true, ignoreComment: true });
  const flat = flattie(json, '.', true);

  // основная логика
  for (const [key, value] of Object.entries(flat)) {
    const isZ = key.endsWith('.attributes.z');
    if (!isZ) continue;

    const base = key.slice(0, -13);
    const isPos = flat[base + '.name'] === 'position';
    if (isPos && isZ) flat[key] = (+value + 50).toFixed(8);
  }

  // собираем файл обратно
  const obj = nestie(flat);
  const xml = js2xml(obj, { spaces: 2 });

  // узнаём полный файл для будущего файла
  const pathObject = path.parse(filePath);
  pathObject.dir = path.join(pathObject.dir, 'exemel');
  const newFilePath = path.format(pathObject);

  // записываем файл
  fs.writeFileSync(newFilePath, xml, 'utf-8');
}

const elapsedTime = process.hrtime(startAt);
console.log(`Done ${prettyHrtime(elapsedTime)}.`);

process.stdin.resume();
