const fs = require('fs');
const path = require('path');
const { xml2js, js2xml } = require('xml-js');
const { flattie } = require('flattie');
const { nestie } = require('nestie');
const prettyHrtime = require('pretty-hrtime');

const startAt = process.hrtime();

// Убираем лишние аргументы
const args = process.argv.slice(2);
console.log('Args:', args);

// Узнаём полный путь до файла
const filePath = args[0];
console.log('File path:', filePath);

// читаем файл и парсим его
const content = fs.readFileSync(filePath, 'utf-8');
const json = xml2js(content, { alwaysChildren: true, ignoreComment: true });

// разбираем файл
console.log('Transforming...');
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
pathObject.name += '-modified';
delete pathObject.base;
const newFilePath = path.format(pathObject);
console.log('New file:', newFilePath);

// записываем файл
fs.writeFileSync(newFilePath, xml, 'utf-8');
const elapsedTime = process.hrtime(startAt);
console.log(`Done ${prettyHrtime(elapsedTime)}.`);

process.stdin.resume();
