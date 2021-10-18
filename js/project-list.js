let users = [];
let questions = [];
let preRows = [];
let postRows = [];
let groupedRows = [];

let questions_doPitch = [];

function getAllKits_doPitch(missionId) {
    let fetches = [];
    questions_doPitch = [];
    getAllContentsByMissionId(access_token, missionId).then(mission => {
        let kits = [];
        mission.content.forEach(content => {
            kits.push({ id: content.id, title: content.kit.title });
        });
        return kits;
    }).then(kits => {
        //iterate over kits
        kits.forEach(kit => {
            fetches.push(getContentById(access_token, kit.id).then(content => {
                console.log("content:");
                console.log(content);
                content.kit.questions.forEach(question => {
                    questions_doPitch.push({ question_id: question.id, question: question.question, kit: content.kit.title, content_id: content.id });
                });
            }));
        });
        Promise.all(fetches).then(input => {
            console.log("questions:");
            console.log(questions_doPitch);
            buildComments_doPitch();
        });
    }
    );
}

function buildComments_doPitch() {
    preRows = [];
    let fetches = [];
    //get user_id from local storage
    let user_id = localStorage.getItem("user_id");
    questions_doPitch.forEach(question => {
        fetches.push(getParentComments(access_token, question.content_id, question.question_id).then(comments => {
            console.log(comments.content);
            comments.content.forEach(comment => {
                let question_text = questions_doPitch.find(q => q.question_id == comment.question_id).question;
                let row = {
                    "id": comment.id,
                    "question_id": comment.question_id,
                    "question": question_text,
                    "author_id": comment.author.id,
                    "author": comment.author.name,
                    "comment": comment.text,
                    "kit": question.kit
                };
                //row[question_text] = comment.text;
                if (row.author_id == user_id) {
                    preRows.push(row);
                }
            });
        }));
    });
    Promise.all(fetches).then(() => {
        console.log("preRows:");
        console.log(preRows);
        postRows = [];
        //get user_id from local storage
        let user_id = localStorage.getItem("user_id");
        preRows.forEach(row => {
            // row[row.question] = row.comment;
            // postRows.push(row);
            let currentD = postRows.find(d => d.author == row.author);
            if (currentD == undefined) {
                const newLocal = {
                    "id": row.id,
                    "author": row.author,
                };
                newLocal[row.question] = row.comment;
                postRows.push(newLocal);
            } else {
                currentD[row.question] = row.comment;
            }
        });
        console.log("postRows:");
        console.log(postRows);
        postRows.forEach(pRow => {
            let currentD = preRows.find(d => d.id == pRow.id);
            let kit = currentD.kit;
            // Group the row by kit and store it in groupedRows
            let currentGroup = groupedRows.find(d => d.kit == kit);
            if (currentGroup == undefined) {
                const newLocal = {
                    "kit": kit,
                    "questions": []
                };
                newLocal.questions.push(pRow);
                groupedRows.push(newLocal);
            } else {
                currentGroup.questions.push(pRow);
            }
        });

        let random_part = Math.floor(Math.random() * postRows.length);
        let columns = ["author"].concat(questions_doPitch.map(q => q.question));
        columns = columns.map(c => {
            // const newId = `${c}_${random_part}`;
            const newId = `${c}`;
            return { "id": newId, "label": c }
        });
        tabulate(postRows, columns);
    });
}

function initializeProjectList() {
    getAllProjects(access_token).then(labs => {
        console.log("getAllProjects()");
        console.log(labs);
        let listProjects = [];
        for (let i = 0; i < labs.length; i++) {
            let currentLab = labs[i];
            if (currentLab.lab.name == null) {
                currentLab.lab.name = "Personal";
            }
            for (let j = 0; j < currentLab.projects.length; j++) {
                const project = currentLab.projects[j];
                console.log(`${currentLab.lab.name} -> ${project.title}`);
                const newProject = {
                    "id": project.id,
                    "title": project.title,
                    "lab_id": currentLab.lab.id,
                    "lab_title": currentLab.lab.name
                };
                listProjects.push(newProject);
            }
        }
        // Using d3 to create the list of projects
        let options = d3.select("#projects-list")
            .on("change", () => {
                // Print the selected project id
                let selected_project = d3.select("#projects-list").property('value');
                localStorage.setItem("selected_project", selected_project);
                updateMapList(selected_project);
                console.log(selected_project);
            })
            .selectAll("option")
            .data(listProjects, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return `${d.lab_title} -> ${d.title}` });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return `${d.lab_title} -> ${d.title}` });
        options.exit().remove();
        localStorage.setItem("selected_project", listProjects[0].id);
        updateMapList(listProjects[0].id);
    });
}

function updateMapList(selected_project) {
    // print selected project
    console.log("selected_project:");
    console.log(selected_project);
    users = [];
    getProjectById(access_token, selected_project).then(project => {
        project.users.forEach(element => {
            users.push({ id: element.id, name: element.name });
        });
        console.log(project.missions);
        let options = d3.select("#missions-list")
            .on("change", () => {
                // Print the selected mission id
                let selected_mission = d3.select("#missions-list").property('value');
                localStorage.setItem("selected_mission", selected_mission);
                updateKitList(selected_mission);
                console.log(selected_mission);
            })
            .selectAll("option")
            .data(project.missions, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.title });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.title });
        options.exit().remove();
        localStorage.setItem("selected_mission", project.missions[0].id);
        updateKitList(project.missions[0].id);
    });
}

function updateKitList(selected_mission) {
    getAllContentsByMissionId(access_token, selected_mission).then(mission => {
        /* 
           Remember that the kit Id is the generic kit! 
           The content Id is the instance of that kit in the mission
           In this function, we are only interested in the instance of the kit
         */
        console.log("printing mission");
        console.log(mission);
        let options = d3.select("#kits-list")
            .on("change", () => {
                // Print the selected kit id
                let selected_kit = d3.select("#kits-list").property("value");
                setSelectedKit(selected_kit);
            })
            .selectAll("option")
            .data(mission.content, d => d.id);
        options.enter()
            .append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.kit.title });
        options.append("option")
            .attr("value", (d) => { return d.id })
            .text((d) => { return d.kit.title });
        options.exit().remove();
        let initialSelectedKit = mission.content[0].id;
        setSelectedKit(initialSelectedKit);
    });
}

function setSelectedKit(kit_id) {
    localStorage.setItem("selected_kit", kit_id);
    buildContentStructure(localStorage.getItem("selected_kit"));
}

function buildContentStructure(content_id) {
    questions = [];
    getContentById(access_token, content_id).then(content => {
        console.log(content);
        content.kit.questions.forEach(question => {
            questions.push({ id: question.id, question: question.question });
        });
    }).then(() => {
        buildComments(content_id);
    });
}

function buildComments(content_id) {
    preRows = [];
    let fetches = [];
    questions.forEach(question => {
        fetches.push(getParentComments(access_token, content_id, question.id).then(comments => {
            console.log("teste");
            console.log(comments.content);
            comments.content.forEach(comment => {
                let question_text = questions.find(q => q.id == comment.question_id).question;
                let row = {
                    "id": comment.id,
                    "question_id": comment.question_id,
                    "question": question_text,
                    "author_id": comment.author.id,
                    "author": comment.author.name,
                    "comment": comment.text,
                };
                //row[question_text] = comment.text;
                preRows.push(row);
            });
        }));
    });
    Promise.all(fetches).then(() => {
        postRows = [];
        console.log("Promises finished.");
        console.log(preRows);
        users.forEach(user => {
            questions.forEach(question => {
                let foundRow = preRows.find(row => row.author_id == user.id && row.question_id == question.id);
                if (foundRow != undefined) {
                    let currentD = postRows.find(d => d.author == user.name);
                    if (currentD == undefined) {
                        const newLocal = {
                            "id": foundRow.id,
                            "author": user.name,
                        };
                        newLocal[question.question] = foundRow.comment;
                        postRows.push(newLocal);
                    } else {
                        currentD[question.question] = foundRow.comment;
                    }
                }
            });
        });
        let random_part = Math.floor(Math.random() * postRows.length);
        let columns = ["author"].concat(questions.map(q => q.question));
        columns = columns.map(c => {
            // const newId = `${c}_${random_part}`;
            const newId = `${c}`;
            return { "id": newId, "label": c }
        });
        tabulate(postRows, columns);
    });
}

function tabulate(output_rows, columns) {
    let table = d3.select('#my-table');
    let thead = d3.select('#my-table').select('thead');
    let tbody = d3.select('#my-table').select('tbody');

    let thread_th = thead.selectAll('th')
        .data(columns, d => d.id);
    thread_th
        .enter()
        .append('th')
        .text(d => d.label);
    thread_th
        .append('th')
        .text(d => d.label);
    thread_th.exit().remove();

    // create a row for each object in the data
    let rows_1 = tbody.selectAll('tr')
        .data(output_rows, d => d.id);
    let rows_2 = rows_1.enter()
        .append('tr');
    rows_1.append('tr');
    rows_1.exit().remove();

    //create a cell with author's comment to the corresponding question column
    let cells_ = rows_2.selectAll('td')
        .data(function (row) {
            let columns_map = columns.map(function (column) {
                let random_part = Math.floor(Math.random() * 100000);
                let newId = `${row["id"]}_${random_part}`;
                return { id: newId, column: column.label, value: row[column.label] };
            });
            //console.log(columns_map);
            return columns_map;
        }, d => d.id);
    cells_.enter()
        .append('td')
        .text(function (d) { return d.value; });
    cells_
        .append('td')
        .text(function (d) { return d.value; });
    cells_.exit().remove();

    return table;
}