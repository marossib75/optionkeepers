import { ClubPageType } from "../../enums/club-page.enum";
import { LoadingState, SearchState } from "../app.reducer";
import { StrategyState } from "../strategy/strategy.reducer";
import ClubAction from "./club.action";

const ClubsState = {
    ...LoadingState,
    ...SearchState,
    page: ClubPageType.Personal,
    club: {
        _id: '',
        creator_userId:'',
        name: '',
        img_path:'',
        members: 0,
        members_list: [],
        nstrategies: 0,
        description:'', 
        created: '',
        published: false,
        upvotes: [],
        admins: [],
        links: [],
        strategies: [],
        cards: {},
        id: '',
    },
    myClubNames: [],
    pagination: {},
}



export function clubsReducer(state = ClubsState, action) {

    switch (action.type) {

        // My personal Clubs

        case ClubAction.Type.LoadClubs:
            return {...state, page: action.pageType, search: action.search, loading: true, failed: false};

        case ClubAction.Type.LoadClubsSuccess:
            return {...state, results: action.pagination.data, pagination: action.pagination.metadata[0], failed: false};

        case ClubAction.Type.LoadClubsFailed:
            return {...state, loading: false, failed: true};       
        
        // Get one club

        case ClubAction.Type.LoadClub:
            return {...state, loading: true, failed: false};

        case ClubAction.Type.LoadClubPage:
            return {...state, loading: true, failed: false};

        case ClubAction.Type.LoadClubSuccess:
            return {...state, club: {...action.club, cards: {}}, failed: false};

        case ClubAction.Type.LoadClubFailed:
            return {...state, loading: false, failed: true};  
        

        // Card management
        case ClubAction.Type.ToggleClubStrategyCard:
            if (!action.active) {
                state.club.cards[action.card.id] = {...StrategyState, ...action.card};
            } else {
                delete state.club.cards[action.card.id];
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};


        case ClubAction.Type.UpdateClubStrategyCard:
            if (action.card.id in state.club.cards) {
                var card = state.club.cards[action.card.id];
                state.club.cards[action.card.id] = {...card, ...action.card};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};



        case ClubAction.Type.LoadClubStrategy:
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, loading: true, failed: false};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};

        case ClubAction.Type.LoadClubStrategySuccess:
            if (action.strategy.id in state.club.cards) {
                var strategy = state.club.cards[action.strategy.id];
                state.club.cards[action.strategy.id] = {...strategy, ...action.strategy, profits: action.profits, loading: false};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};

        case ClubAction.Type.LoadClubStrategyFailed:
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, loading: false, failed: true};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};
        

        // Card chart

        case ClubAction.Type.ToggleClubStrategyChart:
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, chart: {...card.chart, open: !card.chart.open, full: !card.chart.full}};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};

        case ClubAction.Type.LoadClubStrategyChart: 
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, chart: {...card.chart, loading: true, failed: false}};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};
            

        case ClubAction.Type.LoadClubStrategyChartSuccess:
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, chart: {...card.chart, ...action.chart, ...action.data, loading: false}};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};

        case ClubAction.Type.LoadClubStrategyChartFailed:
            if (action.id in state.club.cards) {
                var card = state.club.cards[action.id];
                state.club.cards[action.id] = {...card, chart: {...card.chart, items: [], params: {}, loading: false, failed: true}};
            }
            return {...state, club: {...state.club, cards: {...state.club.cards}}};



        default:
            return {...state, club: {...state.club, cards: {...state.club.cards}} };

    }
}
