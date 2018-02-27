// Graphics Utility
var graphics = (function() {
    var drawButtonWithText = function (game, btnDefinition, btnStyle, text, textStyle, btnName, callback) {
        var graphics = game.add.graphics(100, 100);
        
        graphics.clear();  
        graphics.name = btnName;
    
        var buttonRect = drawRoundedRect(graphics, btnDefinition, btnStyle);
        var buttonText = drawText(game, btnDefinition, text, textStyle);
        buttonRect.addChild(buttonText);
    
        return addInputDownToRect(buttonRect, callback);
    }
    
    var drawText = function (game, txtDefinition, label, labelStyle) {
        var text = game.add.text(txtDefinition.x + txtDefinition.width / 2, txtDefinition.y + txtDefinition.height / 2, label, labelStyle);
        text.smoothed = true;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        return text;
    };
    
    var drawInputText = function (game, iptDefinition, defaultValue, iptStyle) {
        var ipt = game.add.inputField(iptDefinition.x, iptDefinition.y, iptStyle);
        ipt.setText(defaultValue);
        return ipt;
    };

    var deleteButton = function(button) {
        button.children[0].destroy();
        button.clear();
        return null;
    };
    
    var deleteText = function(text){
        text.destroy();
        return null;
    };
    
    // private part
    var drawRoundedRect = function (graphics, btnDefinition, btnStyle) {
        graphics.beginFill(btnStyle.fColor, btnStyle.fAlpha);
        graphics.lineStyle(btnStyle.bSize, btnStyle.bColor, btnStyle.bAlpha);
        graphics.drawRoundedRect(btnDefinition.x, btnDefinition.y, btnDefinition.width, btnDefinition.height, btnStyle.radius);
        graphics.endFill();
        return graphics;
    };
    
    var addInputDownToRect = function(graphics, callback){
        graphics.inputEnabled = true;
        graphics.input.useHandCursor = true;
        graphics.events.onInputDown.add(callback, this);
        return graphics;
    };

    //declare public functions
    return {
        drawButtonWithText: drawButtonWithText,
        drawText: drawText,
        drawInputText: drawInputText,
        deleteButton: deleteButton,
        deleteText: deleteText
    }
}()) 