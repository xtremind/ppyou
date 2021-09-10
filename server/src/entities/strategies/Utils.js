//Public functions
module.exports = function () {
    var rand = function(min, max) {
       return Math.random() * (max - min) + min;
   }
   
   var getRandomItem = function(list, weight) {
       var total_weight = weight.reduce(function (prev, cur) {
           return prev + cur;
       });
       
       var random_num = this.rand(0, total_weight);
       var weight_sum = 0;
       
       for (var i = 0; i < list.length; i++) {
           weight_sum += weight[i];
           weight_sum = +weight_sum.toFixed(2);
           
           if (random_num <= weight_sum) {
               return list[i];
           }
       }
   }

   return {
    rand: rand,
    getRandomItem: getRandomItem
   }
}