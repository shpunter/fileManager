var Model = function (data) {
    var d = null;
    typeof data == 'string' ? d = JSON.parse(data) : d = data;

    this.data = d.data || data;
    this.currentData = d.currentData || null;
    this.workTagName = d.workTagName || null;
    this.lastId = d.lastId || null;
    this.currentId = d.currentId || null;
    this.folderPath = d.folderPath || '/';
};

Model.prototype.searchId = function (id) {
    var self = this;
    var currentResult = null;
    var file = false;

    (function searchFn(obj) {
        obj.forEach(function (element) {
            if (element.idC == id) {
                if (element.type == 'File') {
                    file = !file;
                    currentResult = self.currentData;
                } else {
                    self.lastId = element.idP;
                    currentResult = element;
                    self.folderPath += element.name + '/';

                }
            }
            if (!currentResult) {
                searchFn(element.child);
            }
        });
    })(this.data.tr.child);

    this.currentData = currentResult ;
    return file;
};

Model.prototype.delById = function (id) {
    var stop = false;

    (function searchFn(obj) {
        obj.forEach(function (element, key, array) {
            if (element.idC == id) {
                array.splice(key, 1);
                stop = true;
            }
            if (!stop) {
                searchFn(element.child);
            }
        });
    })(this.data.tr.child);
};

Model.prototype.addData = function (name, folder, id) {
    var map = {
        1: 'Folder',
        0: 'File'
    };

    var obj = {
        idC: id,
        idP: this.currentId,
        type: map[+folder],
        name: name,
        child: []
    };

    var data = this.currentData || this.data.tr;
    data.child.push(obj);
};

Model.prototype.renameData = function (name, id) {
    var stop = false;
    var data = this.currentData || this.data.tr;

    (function searchFn(obj) {
        obj.forEach(function (element) {
            if (element.idC == id) {
                element.name = name;
                stop = true;
            }
            if (!stop) {
                searchFn(element.child);
            }
        });
    })(data.child);
};


var View = function (data) {
    this.model = data;
};

View.prototype.createTable = function () {
    "use strict";

    var createTags = function (tagName, innerHTML, id, className) {
        var result = document.createElement(tagName);

        result.className = className || '';
        result.innerHTML = innerHTML || '';
        result.id = id || '';

        return result;
    };

    var checkbox = function () {
        return '<div class="checkbox">' +
               '    <label>' +
               '        <input type="checkbox">' +
               '    </label>' +
               '</div>';
    };

    var back = function () {
        return createTags('tr', '<td colspan="3">.........</td>');
    };

    var dataTh = this.model.data.th;
    var dataTr = this.model.currentData || this.model.data.tr;

    var tHead = createTags('thead');
    var resultTable = createTags('table', null, null, 'table table-hover');
    var tBody = createTags('tbody');
    var backRow = back();
    backRow.id = 0;

    tBody.appendChild(backRow);

    dataTh.forEach(function (element) {
        tHead.appendChild(createTags('th', element));
    });

    dataTr.child.forEach(function (element) {
        var tmpTr = createTags('tr', null, element.idC);

        tmpTr.appendChild(createTags('td', element.type));
        tmpTr.appendChild(createTags('td', element.name));
        tmpTr.appendChild(createTags('td', checkbox()));

        tBody.appendChild(tmpTr);
    });

    resultTable.appendChild(tHead);
    resultTable.appendChild(tBody);

    return resultTable;
};

View.prototype.delTable = function () {
    var select = document.querySelector('#' + this.model.workTagName);
    select.removeChild(select.firstElementChild);
};

View.prototype.addTable = function (content) {
    var select = document.querySelector('#' + this.model.workTagName);
    select.appendChild(content);
};

View.prototype.render = function (del) {
    !del || this.delTable();

    this.addTable(this.createTable());

    localStorage.setItem('data', JSON.stringify(this.model));
};



var Controller = function (data) {
    this.model = new Model(data || {});
    this.view = new View(this.model);
};

Controller.prototype.load = function (tagName) {
    this.model.workTagName = this.model.workTagName || tagName;
    this.view.render(false);

    return this;
};

Controller.prototype.searchId = function (id) {
    var checker = null;

    (id == 0) ? (checker = this.model.lastId, this.folderPathClean()) : checker = id;

    this.model.searchId(checker) || (this.view.render(true), this.model.currentId = id);
};

Controller.prototype.delData = function (array) {
    array.forEach(function (element) {
        this.model.delById(element);
    }.bind(this));

    this.view.render(true);
};

Controller.prototype.addData = function (name, folder) {
    this.model.addData(name, folder, this.generate());

    this.view.render(true);
};

Controller.prototype.generate = function () {
    var fn = function (n) {
        var string = '', abd = 'abcdefghijklmnopqrstuvwxyz0123456789', aL = abd.length;
        while (string.length < n)
            string += abd[Math.random() * aL|0];
        return string;
    };

    return fn(10);
};

Controller.prototype.renameData = function (array) {
    array.forEach(function (element) {
        this.model.renameData(element.name, element.id);
    }.bind(this));

    this.view.render(true);
};

Controller.prototype.getFolder = function () {
    return this.model.folderPath;
};

Controller.prototype.folderPathClean = function () {
    var folderPath = this.model.folderPath;
    folderPath = folderPath.split('/');

    folderPath.splice(folderPath.length-3, 3);
    this.model.folderPath = folderPath.join("/") + '/';
};


