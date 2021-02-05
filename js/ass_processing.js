function processAss(data) {

    let assDict = {},
        classDict = {};

    for (let item of data) {

        let relation = item["relation"],
            source = item["source"],
            target = item["target"];

        if (assDict.hasOwnProperty(relation)) {

            if (assDict[relation].hasOwnProperty(source)) {
                assDict[relation][source].push(target);
            } else {
                assDict[relation][source] = [target];
            }
            assDict[relation]["maxValue"] = assDict[relation][source].length > assDict[relation]["maxValue"] ? assDict[relation][source].length : assDict[relation]["maxValue"];

            if (assDict[relation].hasOwnProperty(target)) {
                assDict[relation][target].push(source);
            } else {
                assDict[relation][target] = [source];
            }
            assDict[relation]["maxValue"] = assDict[relation][target].length > assDict[relation]["maxValue"] ? assDict[relation][target].length : assDict[relation]["maxValue"];

        } else {

            let relationObject = {};
            relationObject[source] = [target];
            relationObject[target] = [source];
            assDict[relation] = (relationObject);

            assDict[relation]["maxValue"] = 1;
        }

        if (classDict.hasOwnProperty(source)) {
            if (classDict[source].hasOwnProperty(relation)) {
                if (classDict[source][relation].hasOwnProperty("target")) {
                    classDict[source][relation]["target"].push(target);
                } else {
                    classDict[source][relation]["target"] = [target]
                }
            } else {
                classDict[source][relation] = {
                    "target": [target]
                }
            }
        } else {
            let targetObject = {};
            targetObject[relation] = {
                "target": [target]
            };
            classDict[source] = (targetObject);
        }

        if (classDict.hasOwnProperty(target)) {
            if (classDict[target].hasOwnProperty(relation)) {
                if (classDict[target][relation].hasOwnProperty("source")) {
                    classDict[target][relation]["source"].push(source);
                } else {
                    classDict[target][relation]["source"] = [source]
                }
            } else {
                classDict[target][relation] = {
                    "source": [source]
                };
            }
        } else {
            let sourceObject = {};
            sourceObject[relation] = {
                "source": [source]
            };
            classDict[target] = (sourceObject);
        }
    }

    return {
        assDict: assDict,
        classAssDict: classDict
    }
}