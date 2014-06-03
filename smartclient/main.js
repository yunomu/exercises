var button = isc.Button.create({
    top: 200,
    left: 20,
    title: "Click",
    width: 100,
    click: function() {
        isc.say('Hello World');
    }
});

var button2 = isc.Button.create({
    top: 250,
    left: 20,
    title: "Dobule click",
    width: 100,
    doubleClick: function() {
        isc.say('Hello World');
    }
});

isc.TreeGrid.create({
    ID: "grid",
    top: 20,
    left: 200,
    width: 500,
    height: 300,
    canReorderRecords: true,
    fields: [
        {name: "task"},
        {name: "due"},
        {name: "created"},
        {name: "updated"}
    ],
});

grid.data = isc.Tree.create({
    ID: "griddata",
    modelType: "parent",
    idField: "taskId",
    parentIdField: "parentId",
    nameProperty: "Name",
    data: [
        {taskId: "1", parentId: "0", task: "Life", due: "2100-06-03"},
        {taskId: "2", parentId: "1", task: "Life", due: "2100-06-03"},
        {taskId: "3", parentId: "1", task: "Life", due: "2100-06-03"},
        {taskId: "4", parentId: "3", task: "Life", due: "2100-06-03"}
    ]
});

//griddata.dataChanged();
grid.redraw();
