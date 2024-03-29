let budgetController = (() => {

    // Expense Constructor
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Expense constructor inheritance
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // Income Constructor
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Data object
    let data = {
        allItems: {
            expense: [],
            income: []
        },
        total: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };

    // Sum of all items in type array
    let calcTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach(element => sum += element.value);
        data.total[type] = sum;
    };

    // budgetController public methods
    return {
        // Creates instance of Income/Expense and adds to allItems array
        addItem: (type, des, val) => {
            let newItem, ID;

            // Create a new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create a new item based on type
            if (type === 'income') {
                newItem = new Income(ID, des, val);
            } else if (type === 'expense') {
                newItem = new Expense(ID, des, val);
            }

            // Add item to correct data structure
            data.allItems[type].push(newItem);

            // Return the new item
            return newItem;
        },

        // Removes item from allItems array
        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map(element => element.id);

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            };
        },

        calcBudget: () => {
            // Calculate Total Income and Expenses
            calcTotal('expense');
            calcTotal('income');

            // Calculate remaining budget
            data.budget = data.total.income - data.total.expense;

            // Calculate the percentage of income spent on expenses
            if (data.total.income > 0) {
                data.percentage = Math.round((data.total.expense / data.total.income) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calcPercentages: () => {
            data.allItems.expense.forEach(element => element.calcPercentage(data.total.income));
        },

        getPercentages: () => {
            let allPercentages = data.allItems.expense.map(element => element.getPercentage());
            return allPercentages;
        },

        getBudget: () => {
            return {
                totalIncome: data.total.income,
                totalExpenses: data.total.expense,
                budget: data.budget,
                percentage: data.percentage
            }
        }
    }
})();


let uiController = (() => {

    let domStrings = {
        inputType:          '.dropdown',
        inputDescription:   '.add-description',
        inputValue:         '.add-value',
        inputBtn:           '.add-btn',
        incomeContainer:    '.income-list',
        expensesContainer:  '.expenses-list',
        budgetTotal:        '.budget-total',
        budgetIncVal:       '.budget-income-value',
        budgetExpVal:       '.budget-expenses-value',
        budgetExpPerc:      '.budget-expenses-percentage',
        container:          '.container',
        expPercentage:      '.item-percentage',
        date:               '.budget-title-month'
    };

    let formatNumber = (num, type) => {
        let int, dec, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'expense' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            return {
                type:        document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value:       parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },

        addListItem: (obj, type) => {
            let html, newHtml;
            // Create html string with placeholder tags
            if (type === 'income') {

                element = domStrings.incomeContainer;

                html = '<div class="item" id="income-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="far fa-times-circle"></i></button></div></div></div>'
            } else if (type === 'expense') {
                element = domStrings.expensesContainer;

                html = '<div class="item" id="expense-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-percentage"> </div><div class="item-delete"><button class="item-delete-btn"><i class="far fa-times-circle"></i></button></div><div></div>'
            }
            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: (itemID) => {
            let element;

            element = document.getElementById(itemID);
            element.parentNode.removeChild(element);
        },

        displayPercentages: (percentages) => {
            let fields = document.querySelectorAll(domStrings.expPercentage);

            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });
        },

        displayDate : () => {
            let today, year, month, months;
            today = new Date();
            month = today.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = today.getFullYear();
            document.querySelector(domStrings.date).textContent = months[month] + ' ' + year;
        },

        getDomStrings: () => {
            return domStrings;
        },

        clearFields: () => {
            let fields, fieldsArray;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(element => element.value = "");

            fieldsArray[0].focus();
        },

        updateUi: (data) => {
            let type;
            data.budget > 0 ? type = 'income' : type = 'expense'

            document.querySelector(domStrings.budgetTotal).textContent = formatNumber(data.budget, type);
            document.querySelector(domStrings.budgetIncVal).textContent = formatNumber(data.totalIncome, 'income');
            document.querySelector(domStrings.budgetExpVal).textContent = formatNumber(data.totalExpenses, 'expense');

            if (data.percentage > 0) {
                document.querySelector(domStrings.budgetExpPerc).textContent = data.percentage + '%';
            } else {
                document.querySelector(domStrings.budgetExpPerc).textContent = '---'
            }
        },

        changeType: () => {
            let fields;

            fields = document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);

            nodeListForEach(fields, (element) => element.classList.toggle('red-focus'));
        }
    };

})();


let appController = ((budgetCtrl, uiCtrl) => {

    let initializeEventListeners = () => {
        let domStrings = uiCtrl.getDomStrings();

        document.querySelector(domStrings.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(domStrings.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(domStrings.inputType).addEventListener('change', uiCtrl.changeType);
    };

    let updateBudget = () => {
        // Calculate budget
        budgetCtrl.calcBudget();

        // Return the budget
        let budget = budgetCtrl.getBudget();

        // Display budget on UI
        uiCtrl.updateUi(budget);
    };

    let updatePercentages = () => {
        // Calculate percentages
        budgetCtrl.calcPercentages();
        // Read from budget controller
        let percentages = budgetCtrl.getPercentages();
        // Update UI with new percentages
        uiCtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = () => {
        let input, newItem;

        // Get input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add item to UI
            uiCtrl.addListItem(newItem, input.type);

            // Clear fields
            uiCtrl.clearFields();

            // Calculate and update budget
            updateBudget();

            // Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete item from data
            budgetCtrl.deleteItem(type, ID);

            // Recalculate budget after deleting item
            budgetCtrl.calcBudget();

            // Delete item from UI
            uiCtrl.deleteListItem(itemID);

            // Update the UI
            updateBudget();

            // Update Percentages
            updatePercentages();

        };
    };

    return {
        init: () => {
            initializeEventListeners();
            uiCtrl.displayDate();
            uiCtrl.updateUi({
                totalIncome: 0,
                totalExpenses: 0,
                budget: 0,
                percentage: -1
            });
        }
    }


})(budgetController, uiController);

// Application initialization
appController.init();
