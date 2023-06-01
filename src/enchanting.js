class Enchanting {
    constructor() {
        this.price = [0, 0, 0, 0, 0, 0];
        this.fsCost = [0, 0, 0, 0, 0];
        this.cron = [false, false, false, false, false];
        this.fs = [18, 40, 44, 110, 250];
        this.reblathFs = [20, 25, 36, 52, 87, 97];
        this.additionalChanceCost = 0;
        this.cronAmount = [62, 187, 562, 1562, 7499];
        this.cronPrice = 0;
        this.armor = 0;
        this.concentrated = 0;
        this.baseFs = 0;
    };

    calculateChance(fs, level) {
        /* fs stands for failstack
        level variable represents original upgrade level of given accessory
        higher failstack makes succes chance higher
        this method calculates chance of single upgrade success */
        const softcap = [18, 40, 45, 110, 490];
        const chancePerFs = [2.5, 1, 0.75, 0.25, 0.05];
        const chanceAfterSoftcap = [0.5, 0.2, 0.15, 0.05, 0.01];
        let chance = [25.0, 10.0, 7.5, 2.5, 0.5];
        chance = chance[level];

        for (let i = 0; i < fs; i++) {
            if (i < softcap[level]){
                chance += chancePerFs[level]
            } else {
                chance += chanceAfterSoftcap[level]
            };
        };
        if (chance > 90) { chance = 90 };
        chance /= 100;
        return chance;
    };

    calculateCost(useFsValue) {
        this.fs[4] = 230 + this.baseFs + 13; // stack with Origin of Dark Hunger
        // this method calculates average cost of making an accessory
        const chances = [];
        const numberOfTaps = [];
        const averageCost = [];
        
        for (let i = 0; i < 5; i++) {
          chances.push(this.calculateChance(this.fs[i], i));
          numberOfTaps.push(1 / chances[i]);
          averageCost.push(this.price[0] * numberOfTaps[i]); // base accessory cost
          
          if (this.cron[i] === false) {
            if (i === 0) {
              averageCost[i] += this.price[i] * numberOfTaps[i];
            } else {
              averageCost[i] += averageCost[i - 1] * numberOfTaps[i];
            };
          } else if (this.cron[i] === true) {
            // cron cost
            averageCost[i] += this.cronAmount[i] * this.cronPrice * numberOfTaps[i];
            
            if (i > 0) {
              // downgrade cost
              averageCost[i] += (1 - chances[i]) * 0.4 * numberOfTaps[i] * (averageCost[i - 1] -  this.price[i - 1]);
              averageCost[i] += averageCost[i - 1];
            } else {
              averageCost[i] += this.price[i];
            };
          };
          
          if (useFsValue !== false) {
            averageCost[i] += this.fsCost[i]
          };

          this.price[i + 1] = averageCost[i];
          averageCost[i] = parseFloat(averageCost[i]);
        };
        if (useFsValue !== false) { averageCost[4] += 300 * 25 }; // add essence of limits cost

        return averageCost;
    };

    calcFsCost() {
        // fs cost with reblath
        for (let i = 0; i < 5; i++) {
          this.fsCost[i] = this.calcOneFsCost(this.fs[i]);
        };
      };
      
    calcOneFsCost(fs) {
        let cost = 0;
        let tempFs = this.baseFs;
        while (tempFs < fs) {
          if (tempFs <= 5) {
            tempFs += this.reblathFs[0];
            cost += this.additionalChanceCost * this.armor;
          } else if (tempFs < this.reblathFs[1]) {
            tempFs += 1;
            cost += this.armor;
            cost += 0.058 * cost + 0.1; // estimated cost of success (lost failstack)
          } else if (tempFs < this.reblathFs[2]) {
            tempFs += 3;
            cost += this.concentrated;
          } else if (tempFs < this.reblathFs[3]) {
            tempFs += 4;
            cost += this.concentrated
            cost += this.calcOneFsCost((this.reblathFs[1]) + 9); // estimated cost of duo rebalth
          } else if (tempFs < this.reblathFs[4]) {
            tempFs += 5;
            cost += this.concentrated
            cost += (this.calcOneFsCost((this.reblathFs[2] + 9)) - this.calcOneFsCost((this.reblathFs[1] + 9))); // estimated cost of tri rebalth
          } else if (tempFs < this.reblathFs[5]) {
            tempFs += 6;
            cost += this.concentrated
            cost += (this.calcOneFsCost((this.reblathFs[3] + 35)) - this.calcOneFsCost((this.reblathFs[2] + 9))); // estimated cost of tet rebalth
          } else if (tempFs <= 110) {
            tempFs += 13;
            cost += (4 * 13);
            break;
          };
        };
        return cost;
    };

    adjustFailstack() {
      // this methid increment failstack value and search for lower cost
      let previousFs = 0
      let cost = [];
      let previousCost = [];
      for (let i = 0; i < 5; i++){
        do {
          previousCost = this.calculateCost();
          previousFs = this.fs[i]
          if (this.fs[i] <= 5) {
            this.fs[i] += this.reblathFs[0]
          } else if (this.fs[i] < this.reblathFs[1]) {
            this.fs[i] += 1;
          } else if (this.fs[i] < this.reblathFs[2]) {
            this.fs[i] += 3;
          } else if (this.fs[i] < this.reblathFs[3]) {
            this.fs[i] += 4;
          } else if (this.fs[i] < this.reblathFs[4]) {
            this.fs[i] += 5;
          } else if (this.fs[i] < this.reblathFs[5]) {
            this.fs[i] += 6;
          };
          this.calcFsCost();
          cost = this.calculateCost();
        } while (previousCost[i] > cost[i] && this.fs[i] <= 97);
        this.fs[i] = previousFs;
        // add 13 valk's cry if stack is higher than 90
        if( this.fs[i] <= 100 && this.fs[i] >= 90){ this.fs[i] += 13 };
      };
    };

    cronStrategy() {
      let cost = [];
      let previousCost = [];
      for (let i = 0; i < 5; i++){
        previousCost = this.calculateCost();
        this.cron[i] = true;
        cost = this.calculateCost();
        if (previousCost[i] < cost[i]){
          this.cron[i] = false;
        };
      };
    };

};

export default Enchanting;
