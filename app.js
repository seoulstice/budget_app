var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
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

    var calcTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(element) {
            sum += element.value;
        });
        data.total[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            // Create undefined variables
            var newItem, ID;

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

        calcBudget: function() {
            // Calculate Total Income and Expenses
            calcTotal('expense');
            calcTotal('income');

            // Calculate remaining budget
            data.budget = data.total.income - data.total.expense;

            // Calculate the percentage of income spent on expenses
            data.percentage = Math.round((data.total.expense / data.total.income) * 100);
        },

        getBudget: function() {
            return {
                totalIncome: data.total.income,
                totalExpenses: data.total.expense,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})();


var uiController = (function() {

    var domStrings = {
        inputType:          '.dropdown',
        inputDescription:   '.add-description',
        inputValue:         '.add-value',
        inputBtn:           '.add-btn',
        incomeContainer:    '.income-list',
        expensesContainer:  '.expenses-list'

    };

    return {
        getInput: function(){
            return {
                type:        document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value:       parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml;
            // Create html string with placeholder tags
            if (type === 'income') {

                element = domStrings.incomeContainer;

                html = '<div class="item" id="income-%id%"><div class="item-description">%description%</div><div class=""><div class="item__value">%value%</div><div class="item-delete"><button class="item-delete-btn">Delete</button></div></div></div>'
            } else if (type === 'expense') {
                element = domStrings.expensesContainer;

                html = '<div class="item" id="expense-%id%"><div class="item-description">%description%</div><div class=""><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)


        },

        getDomStrings: function() {
            return domStrings;
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(element) {
                element.value = "";
            });

            fieldsArray[0].focus();
        }
    };

})();


var appController = (function(budgetCtrl, uiCtrl) {

    var initializeEventListeners = function() {
        var domStrings = uiCtrl.getDomStrings();

        document.querySelector(domStrings.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function() {
        // Calculate budget
        budgetCtrl.calcBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display budget on UI
        console.log(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;

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
        }
    };

    return {
        init: function() {
            initializeEventListeners();
        }
    }


})(budgetController, uiController);

appController.init();
