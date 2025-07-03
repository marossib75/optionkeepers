import React from "react";
import { BsBookmarkFill, BsFillPersonFill } from "react-icons/bs";
import { MdPublic } from "react-icons/md";
import { TiArrowUpThick } from "react-icons/ti";
import { StrategyPageType } from "../../../../enums/strategy-page.enum";
import { getCountryMoneyFormat } from "../../../../utils/currency.format";


import "./BaseListGroupElement.css";

function BaseListGroupItem(strategy, page, username) {
    const {name, from_user, published, userId, stats, country, upvotes, bookmarks} = strategy
    const {original} = stats

    const isMine = username == userId;

    return (
        <span className="app-list-group-item">
            {isMine || published ?
            <>
                {page == StrategyPageType.Personal &&
                    <div className="app-list-group-item--visibility">
                        <MdPublic style={{color: published? 'green': 'darkred'}}/>
                    </div>
                }
                <div className="app-list-group-item--name-user">
                    <div>{name}</div>
                    {page == StrategyPageType.Personal ? 
                        <div className="app-list-group-item--upvotes" style={{fontSize:'12px'}}>
                            {bookmarks} <BsBookmarkFill className="app-list-group-item--upvote-icon"/>
                        </div>
                        :
                        isMine ?
                            <div className="app-list-group-item--user"><BsFillPersonFill/> You</div>
                            :
                            <div className="app-list-group-item--user">{userId}</div>       
                    }
                    {page === StrategyPageType.Shared &&
                        <div className="app-list-group-item--user">Sent by: <b>{from_user}</b></div>
                    }
                </div>
                <div className="app-list-group-item--stats" >
                    <div className="app-list-group-item--profit" style={{color: original.possibleROI >= original.cost ? "green" : "red"}}>
                        {getCountryMoneyFormat(country,  original.possibleROI - original.cost)}
                    </div>
                    <div className="app-list-group-item--upvotes">
                        {upvotes} <TiArrowUpThick className="app-list-group-item--upvote-icon"/>
                    </div>
                </div>
            </>
            :
            <>
                <div>{name} has become private</div>
            </>
            }
        </span>
    );
};
export default BaseListGroupItem;
