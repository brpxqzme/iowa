// a minimal random number generator
var Prng = function (seed) {
    var kernel = Math.abs(Math.floor(seed)),
        bigprime = 2147483647,
        littleprime = 16807;
    return {
        randInt:
            function () {
                kernel *= littleprime;
                kernel %= bigprime;
                return kernel;
            },
        randFlt:
            function () {
                return this.randInt()/bigprime;
            },
        // standard normal distribution
        // not as nice as Box-Muller but it's not broken
        randStd:
            function () {
                return (this.randFlt()*2-1) +
                       (this.randFlt()*2-1) +
                       (this.randFlt()*2-1);
            },
        // normal distribution given mean and standard deviation
        randGauss:
            function (mu, sigma) {
                return this.randStd()*sigma + mu;
            },
        lastInt:
            function () {
                return kernel;
            }
    }
}

