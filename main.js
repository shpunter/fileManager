var configForTable = {
    th: ['Type', 'Name', ''],
    tr: {
        idC: 'c34kdlbmv1',
        idP: null,
        child: [
            {
                idC: 'c34kdlbmvv',
                idP: 'c34kdlbmv1',
                type: 'Folder',
                name: 'name1',
                child: [
                    {
                        idC: 'c34kdlbmvq',
                        idP: 'c34kdlbmvv',
                        type: 'Folder',
                        name: 'name3',
                        child: [
                            {
                                idC: 'c34kdlbmv4',
                                idP: 'c34kdlbmvq',
                                type: 'Folder',
                                name: 'name4',
                                child: []
                            },
                            {
                                idC: 'c34kdlbmv5',
                                idP: 'c34kdlbmvq',
                                type: 'Folder',
                                name: 'name5',
                                child: []
                            },
                            {
                                idC: 'c34kdlbmv6',
                                idP: 'c34kdlbmvq',
                                type: 'Folder',
                                name: 'name6',
                                child: []
                            }
                        ]
                    }
                ]
            }
        ]
    }

};

(function () {
    "use strict";

    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            var data = localStorage.data || configForTable;


            var main = new Controller(data).load('result');

            var clickFn = function (event) {
                if (event.target.nodeName == 'TD') {
                    main.searchId(event.target.parentNode.id);
                }
            };

            var listeners = function listeners () {
                var trCollection = document.querySelectorAll('#result>table>tbody>tr');

                trCollection = [].slice.call(trCollection);

                trCollection.forEach(function (element) {
                    element.addEventListener('click', clickFn);
                });

                document.querySelector('#folder').innerHTML = main.getFolder();
            };

            listeners();

            var target = document.querySelector('#result');
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function() {
                    listeners();
                });
            });

            var config = { attributes: true, childList: true, characterData: true };
            observer.observe(target, config);

            var findAllChecked = function () {
                var inputs = document.querySelectorAll('input[type=checkbox]');
                var arrayOfCheckBox = [].filter.call(inputs, function(el) {
                    return el.checked
                });

                var result = [];

                var getIdOfTr = function getIdOfTr(element) {
                    var tmp = element.parentNode;
                    (tmp.nodeName == 'TR') ? result.push(tmp.id) : getIdOfTr(element.parentNode);
                };

                arrayOfCheckBox.forEach(function (element) {
                    getIdOfTr(element);
                });

                return result;
            };

            document.querySelector('#del').addEventListener('click', function () {
                var result = findAllChecked();
                main.delData(result);
            });

            document.querySelector('#createFolder').addEventListener('click', function () {
                main.addData(document.querySelector('#textFolder').value, true);
            });

            document.querySelector('#createFile').addEventListener('click', function () {
                main.addData(document.querySelector('#textFile').value, false);
            });

            document.querySelector('#rename').addEventListener('click', function () {
                var result = findAllChecked();

                result.forEach(function (element) {
                    var elementTag = document.querySelector('#' + element).childNodes[1];
                    var textToSave = elementTag.innerHTML;

                    elementTag.innerHTML = '<input type="text" class="form-control" name="toSave" id="' + element + '" value="' + textToSave + '">';
                });

            });

            document.querySelector('#save').addEventListener('click', function () {
                var collection = document.querySelectorAll('input[name=toSave]');
                collection = [].slice.call(collection);
                var arrayToSave = [];

                collection.forEach(function (element) {
                    arrayToSave.push({name: element.value, id: element.id});
                });

                main.renameData(arrayToSave);
            });
        }
    }
})();
