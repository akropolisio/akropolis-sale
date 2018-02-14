pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Whitelist.sol';
import "./SaleConfiguration.sol";

/**
 * @title WhitelistedCrowdsale
 * @dev Adding a support for whitelisting users during a crowdsale.
 * Whitelisted users will be divided into 3 tiers
 * Tier 1: Can enter the crowdsale from round 1, have it's own min and max contribution limits
 * Tier 2: Can enter the crowdsale from round 2, have it's own min and max contribution limits
 * Tier 3: Can enter the crowdsale from round 3, there are no limits for this tier
 * Limits are awarded per user not per round
 */
contract WhitelistedCrowdsale is Ownable{
    using SafeMath for uint256;

    Whitelist whitelist;
    SaleConfiguration config;

    uint256[] min = new uint[](4);
    uint256[] max = new uint[](4);

    uint256 startTime;
    uint256 endTime;
    uint256 roundDuration;

    function WhitelistedCrowdsale(uint256 _startTime, uint256 _endTime, Whitelist _whitelist, SaleConfiguration _config) public {
        startTime = _startTime;
        endTime = _endTime;

        whitelist = _whitelist;
        config = _config;

        setCapsPerTier(1, config.MIN_TIER_1(), config.MAX_TIER_1());
        setCapsPerTier(2, config.MIN_TIER_2(), config.MAX_TIER_2());
        setCapsPerTier(3, 0, config.MAX_CONTRIBUTION_VALUE());
        setRoundDuration(config.ROUND_DURATION());
    }

    function setCapsPerTier(uint8 _tier, uint256 _min, uint256 _max) public onlyOwner {
        require(_min >= 0);
        require(_max  >= _min);
        require(_max  <= config.MAX_CONTRIBUTION_VALUE());
        min[_tier] = _min;
        max[_tier] = _max;
    }

    function setRoundDuration(uint256 _roundDuration) public onlyOwner {
        require(_roundDuration > 0);
        require(_roundDuration.mul(3) <= endTime.sub(startTime));
        roundDuration = _roundDuration;
    }

    function getCurrentRound() public view returns(uint256) {
        uint256 round = now.sub(startTime).div(roundDuration).add(1);
        if (round > 3) {
            round = 3;
        }
        return round;
    }

    function getCap(address _buyer) public view returns(uint256) {
        if (getCurrentRound() >= 3) {
            return config.MAX_CONTRIBUTION_VALUE();
        } else {
            return max[whitelist.getTier(_buyer)];
        }
    }

    function getMin(address _buyer) public view returns(uint256) {
        if (getCurrentRound() >= 3) {
            return 0;
        } else {
            return min[whitelist.getTier(_buyer)];
        }
    }

    function isBuyerAdmitted(address _buyer) public view returns(bool) {
        uint8 tier = whitelist.getTier(_buyer);
        return tier <= getCurrentRound();
    }

}