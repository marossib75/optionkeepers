import React from "react";
import { EmailShareButton,FacebookShareButton, LinkedinShareButton, RedditShareButton, TelegramShareButton, TwitterShareButton, WhatsappShareButton} from "react-share";
import { EmailIcon, FacebookIcon, LinkedinIcon, RedditIcon, TelegramIcon, TwitterIcon, WhatsappIcon } from "react-share";
import { FiLink } from "react-icons/fi";

import "./SocialLinkShare.css"

function SocialLinkShare({shareUrl, title}){
    return(
        <div>
            <div className="app-share-modal--social-column">
                    <div
                        className="app-share-modal--icon app-share-modal--social-icon"
                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                    >
                        <FiLink />
                    </div>
                    <TwitterShareButton
                        url={shareUrl}
                        title={title}
                        className="app-share-modal--social-icon"
                    >
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <FacebookShareButton
                        url={shareUrl}
                        quote={title}
                        className="app-share-modal--social-icon"
                        >
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <TelegramShareButton
                        url={shareUrl}
                        title={title}
                        className="app-share-modal--social-icon"
                    >
                        <TelegramIcon size={32} round />
                    </TelegramShareButton>
                    <WhatsappShareButton
                        url={shareUrl}
                        title={title}
                        separator=":: "
                        className="app-share-modal--social-icon"
                    >
                        <WhatsappIcon size={32} round />
                    </WhatsappShareButton>
                    <LinkedinShareButton 
                        url={shareUrl} 
                        className="app-share-modal--social-icon"
                    >
                        <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <RedditShareButton
                        url={shareUrl}
                        title={title}
                        windowWidth={660}
                        windowHeight={460}
                        className="app-share-modal--social-icon"
                    >
                        <RedditIcon size={32} round />
                    </RedditShareButton>
                    <EmailShareButton
                        url={shareUrl}
                        subject={title}
                        body="body"
                        className="app-share-modal--social-icon"
                    >
                        <EmailIcon size={32} round />
                    </EmailShareButton>
                </div>
            </div>
    )
}

export default SocialLinkShare;