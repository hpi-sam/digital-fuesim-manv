const json2html = require('node-json2html');

/**
 * With the help of: https://gist.github.com/joviano-dias/f9bfb8af690a89bcf7d83213e6009b13
 * and https://www.w3schools.com/html/tryit.asp?filename=tryhtml_table_intro
 */

let template_table_header = {
    '<>': 'tr',
    html: [
        { '<>': 'th', html: 'Name' },
        { '<>': 'th', html: 'Url' },
        { '<>': 'th', html: 'licenseName' },
        { '<>': 'th', html: 'licenseText' },
    ],
};

let template_table_body = {
    '<>': 'tr',
    html: [
        { '<>': 'td', html: '${name}' },
        { '<>': 'td', html: '${url}' },
        { '<>': 'td', html: '${licenseName}' },
        { '<>': 'td', html: '${licenseText}' },
    ],
};

let data = require('./frontend/src/assets/source-code/THIRD-PARTY-LICENSE-ACKNOWLEDGEMENTS.json');

let table_header = json2html.transform(data[0], template_table_header);
let table_body = json2html.transform(data, template_table_body);

let style = `<style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th {
                border: 1px solid #dddddd;
            }
            tr:nth-child(even) {
                background: #dddddd;
            }
            tr:nth-child(even) td {
                border: 1px solid white;
            }
            tr:nth-child(odd) td {
                border: 1px solid #dddddd;
            }
            td:last-child {
                white-space:pre-wrap;
            }
        </style>`;

let header =
    '<!DOCTYPE html>' +
    '<html lang="en">\n' +
    '<head><title>Third Party Licenses</title>' +
    style +
    '</head>';
let body =
    '<input type="button" value="Zur&uuml;ck" onclick="history.back()">' +
    '<h1>Third Party Licenses</h1><br><table>\n<thead>' +
    table_header +
    '\n</thead>\n<tbody>\n' +
    table_body +
    '\n</tbody>\n</table>';
body = '<body>' + body + '</body>';
let html = header + body + '</html>\n';

const fs = require('fs');
fs.writeFileSync(
    './frontend/src/assets/source-code/THIRD-PARTY-LICENSE-ACKNOWLEDGEMENTS.html',
    html
);
console.log('THIRD-PARTY-LICENSE-ACKNOWLEDGEMENTS.html created');
