const SpeedRate = function() {
    let speedRate = 10;

    function set(value) {
        speedRate = value;
    }

    function get() {
        return speedRate;
    }

    return {
        set,
        get
    };
}();

export default SpeedRate;
