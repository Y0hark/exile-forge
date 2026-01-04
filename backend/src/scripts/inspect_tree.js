const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/Users/samuelgaliere/Documents/code/exile-forge/backend/src/data/PoBPOE2/TreeData/0_4/tree.json', 'utf8'));

console.log("Keys in JSON:", Object.keys(data));
const nodeKeys = Object.keys(data.nodes);
console.log("Total nodes:", nodeKeys.length);
console.log("First 5 node IDs:", nodeKeys.slice(0, 5));

const sampleId = nodeKeys[0];
console.log("\nSample Node (" + sampleId + "):");
console.log(JSON.stringify(data.nodes[sampleId], null, 2));

const keystoneId = nodeKeys.find(id => data.nodes[id].isKeystone);
if (keystoneId) {
    console.log("\nSample Keystone (" + keystoneId + "):");
    console.log(JSON.stringify(data.nodes[keystoneId], null, 2));
}

const notableId = nodeKeys.find(id => data.nodes[id].isNotable);
if (notableId) {
    console.log("\nSample Notable (" + notableId + "):");
    console.log(JSON.stringify(data.nodes[notableId], null, 2));
}
