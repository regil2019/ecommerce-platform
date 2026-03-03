
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const SubscribeButton = ({
    buttonColor = "#000000",
    buttonTextColor = "#ffffff",
    subscribeStatus = false,
    initialText = "Subscribe",
    changeText = "Subscribed",
}) => {
    const [isSubscribed, setIsSubscribed] = useState(subscribeStatus);
    const [email, setEmail] = useState("");

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            // Here you would typically call an API
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isSubscribed ? (
                <motion.button
                    className="relative flex h-10 w-[200px] items-center justify-center overflow-hidden rounded-md bg-white outline outline-1 outline-black"
                    onClick={() => setIsSubscribed(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.span
                        key="action"
                        className="relative block h-full w-full font-semibold"
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        style={{ color: buttonColor }}
                    >
                        {changeText}
                    </motion.span>
                </motion.button>
            ) : (
                <motion.form
                    onSubmit={handleSubscribe}
                    className="relative flex h-10 w-[200px] items-center justify-center overflow-hidden rounded-md bg-white outline outline-1 outline-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        className="h-full w-full border-none px-2 text-sm focus:outline-none focus:ring-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <motion.button
                        type="submit"
                        className="relative h-full px-4 font-semibold"
                        style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                        initial={{ x: 50 }}
                        animate={{ x: 0 }}
                    >
                        <motion.span
                            key="reaction"
                            className="relative block"
                            initial={{ x: 0 }}
                            exit={{ x: 50, transition: { duration: 0.1 } }}
                        >
                            {initialText}
                        </motion.span>
                    </motion.button>
                </motion.form>
            )}
        </AnimatePresence>
    );
};
