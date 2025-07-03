import { ModalType } from "./modal-type.enum";
import { CreateMarketStrategy, DeleteMarketStrategy, UpdateMarketStrategy } from "../state/market/actions/market-strategy.action";
import { CreateStrategy, DeleteStrategy, UpdateStrategy } from "../state/strategy/strategy.action";
import { CloseClub, CreateClub, RemoveMemberCLub, UpdateClubSettings } from "../state/club/club.action";
import { NavigateTo } from "../state/app.action";

export const ModalCatalog = {
    ErrorMessage: (message) => ({
        title: "Oops...",
        props: { message },
        render: ModalType.Message
    }),
    // Strategy
    CreateStrategy: (groups) => ({
        title: "Create a new strategy",
        props: {groups: groups, onSubmit: ({groupId, name, published}) => CreateStrategy(groupId, name, published)},
        render: ModalType.Strategy,
    }),
    UpdateStrategy: (strategy) => ({
        title: "Update strategy",
        props: {name: strategy.name, published: strategy.published, onSubmit: ({name, published}) => UpdateStrategy(strategy.id, name, published, null, null)},
        render: ModalType.Strategy,
    }),
    DeleteStrategy: (id) => ({
        title: "Delete strategy",
        props: {message: "Are you sure?", onSubmit: () => DeleteStrategy(id)},
        render: ModalType.Confirm,
    }),
    ShareStrategy: (strategy) => ({
        title: "Share Strategy",
        props: {strategy: strategy},
        render: ModalType.ShareStrategy,
    }),
    // Market
    CreateMarketStrategy: (tab) => ({
        title: "Create a new strategy",
        props: {onSubmit: ({name, published}) => CreateMarketStrategy(tab, name, published)},
        render: ModalType.Strategy,
    }),
    UpdateMarketStrategy: (tab, strategy) => ({
        title: "Update strategy",
        props: {name: strategy.name, published: strategy.published, onSubmit: ({name, published}) => UpdateMarketStrategy(tab, name, published, null, null)},
        render: ModalType.Strategy,
    }),
    DeleteMarketStrategy: (tab) => ({
        title: "Delete strategy",
        props: {message: "Are you sure?", onSubmit: () => DeleteMarketStrategy(tab)},
        render: ModalType.Confirm,
    }),
    // Clubs
    CreateClub: () => ({
        title: "Create a new club",
        props: {onSubmit: ({name, published, description, img_path, links}) => CreateClub(name, published, description, img_path, links)},
        render: ModalType.Club,
    }),
    UpdateClubSettings: (club, isCreator) => ({
        title: "Modify club settings",
        props: {isCreator: isCreator, name: club.name, published: club.published, description: club.description, img_path: club.img_path, links: club.links ,
                onSubmit: ({name, published, description, img_path, links}) => UpdateClubSettings(club.id, name, published, description, img_path, links)},
        render: ModalType.Club,
    }),
    ShareClub: (club) => ({
        title: "Share Club",
        props: {members: club.members_list, clubId: club._id},
        render: ModalType.ShareClub,
    }),
    LeaveClub: (username, clubId) => ({
        title: "Leaving club",
        props: {message: "Are you sure?", onSubmit: () => RemoveMemberCLub(username, clubId)},
        render: ModalType.Confirm,
    }),
    CloseClub: (clubId) => ({
        title: "Close club",
        props: {message: "Are you sure?", onSubmit: () => CloseClub(clubId)},
        render: ModalType.Confirm,
    }),
}