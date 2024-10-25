"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import Face1SVG from "../../assets/howitworks/face1.svg";
import Face2SVG from "../../assets/howitworks/face2.svg";
import Face3SVG from "../../assets/howitworks/face3.svg";
import Face4SVG from "../../assets/howitworks/face4.svg";
import WhyZkProof from "../../assets/howitworks/WhyZkProofs.svg";
import BlueQuestionMark from "../../assets/howitworks/BlueQuestionMark.svg";
import FacesCircle from "../../assets/howitworks/FacesCircle.svg";
import ThinkingFaces from "../../assets/howitworks/ThinkingFaces.svg";
import VotesMinaAmount from "../../assets/howitworks/VotesMinaAmount.svg";
import AllCounters from "../../assets/howitworks/AllCounters.svg";
import FacesLine from "../../assets/howitworks/FacesLine.svg";

const HowItWorks = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex justify-center">
      <div className="w-[1280px] flex flex-col justify-center items-center">
        <div className="mt-14 w-full flex flex-col">
          <motion.div
            className="flex flex-col items-start mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-primary text-[64px]"
              variants={fadeInUp}
            >
              # zkVot - <span className="italic">How it works?</span>
            </motion.h1>
          </motion.div>

          <motion.div
            className="pl-4 w-full flex flex-col items-center mb-28"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="mt-10 w-full flex items-center"
              variants={fadeInUp}
            >
              <div className="min-w-[301px] min-h-[208px]">
                <Image
                  src={Face1SVG}
                  alt="Face 1"
                  width={301}
                  height={208}
                />
              </div>

              <div className="ml-8 max-w-[740px]">
                <p
                  className="text-white font-montserrat text-[16px] leading-[32px]"
                  style={{
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                >
                  Let's say you and your friends at the office want to make a
                  decision together. You want to vote on a proposal, but you
                  want to keep your votes secret from each other. You also want
                  to make sure that the votes are counted correctly. zkVot makes
                  this possible, but how?
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mt-[60px] w-full h-[170px] flex justify-end pr-8"
              variants={fadeInUp}
            >
              <div className="relative w-[600px] h-[170px]">
                <p
                  className="text-white max-w-[515px] font-montserrat text-[16px] leading-[32px]"
                  style={{
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                >
                  Your friend Necip creates an election via zkVot app by
                  providing a list of voters, options, and a question. <br />
                  (on <em>Mina</em> blockchain, we'll explain why)
                </p>
                <div className="absolute bottom-0 right-0">
                  <Image
                    src={Face2SVG}
                    alt="Face 2"
                    width={240}
                    height={140}
                  />
                </div>
              </div>
            </motion.div>
            <motion.div
              className="mt-[55px] w-[1140px] h-[290px] flex items-center justify-center relative"
              variants={fadeInUp}
            >
              <div className="absolute w-[278px] h-[217px] top-0 left-0">
                <Image
                  src={Face3SVG}
                  alt="Face 3"
                  width={278}
                  height={217}
                />
              </div>
              <div className="mb-4">
                <h1 className="text-white font-montserrat text-[24px]">
                  You see you are a voter in the election, and you want to vote.
                </h1>
                <h1 className="w-[477px] pt-2 text-white font-montserrat text-[16px] leading-[32px]">
                  You select the option you want to vote for, and you create a
                  <span className="italic"> zk-proof</span> with a click of a
                  button in app.
                </h1>
              </div>
              <div className="absolute w-[326px] h-[132px] bottom-0 right-0">
                <Image
                  src={Face4SVG}
                  alt="Face 4"
                  width={326}
                  height={132}
                />
              </div>
            </motion.div>
          </motion.div>

          <div className="pl-4 w-full flex flex-col items-center mb-28">
            <motion.div
              className="mt-[60px] flex w-full justify-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <div className="w-[639px] flex flex-col justify-center items-start">
                <Image
                  src={WhyZkProof}
                  alt="Why zkProof"
                  width={347}
                  height={187}
                  className="ml-4"
                />
                <div className="mt-6 flex flex-row">
                  <Image
                    src={BlueQuestionMark}
                    alt="Blue Question Mark"
                    width={91.4}
                    height={133.5}
                  />
                  <div className="w-full">
                    <h1 className="ml-2 text-white font-montserrat text-[16px] leading-[32px]">
                      Why do we need a zk-proof? Because the generated zk-proof
                      shows
                    </h1>
                    <h1 className="ml-4 text-white font-montserrat text-[16px] leading-[32px]">
                      that someone who is eligible to vote, voted for a specific
                      option
                    </h1>
                    <h1 className="ml-2 text-white font-montserrat text-[16px] leading-[32px]">
                      without revealing the voter's identity. This is the magic
                      of zk-proofs.
                    </h1>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-[140px] w-[956px] h-[532px] flex items-center justify-center relative"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Image
                src={FacesCircle}
                alt="Faces Circle"
                width={956}
                height={532}
              />
              <div className="absolute">
                <div className="flex flex-col items-center justify-center w-[595px] text-center">
                  <h1 className="text-[24px] text-white font-montserrat">
                    Is it done?
                  </h1>
                  <h1 className="text-white font-montserrat text-[16px] leading-[32px] mt-4">
                    No, you submit your vote proof to a place{" "}
                    <span className="italic">
                      where anyone in the world can see it
                    </span>
                    . Remember that it doesn't reveal your identity, but it
                    shows that someone voted for a specific option.
                  </h1>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-[108px] w-[815px]"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <h1 className="text-center text-white font-montserrat text-[16px] leading-[32px]">
                Now who will count the votes? The answer is simple: everyone who
                wants to count the votes. Since all the votes are public, anyone
                can count the votes. (even you)
              </h1>
            </motion.div>

            <motion.div
              className="mt-[80px] text-center w-[815px] flex flex-col relative"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Image
                src={ThinkingFaces}
                alt="Thinking Faces"
                width={778}
                height={269}
              />
              <h1 className="mt-[57px] text-white font-montserrat text-[16px] leading-[32px]">
                The counters{" "}
                <span className="italic">read all the vote proofs</span>, and
                they verify that the zk-proofs are valid. They combine the valid
                proofs and generate a final result zk-proof. This final result
                cannot be faked with fake votes, and it shows the final result
                of the election. (example: 10 votes for option A, 5 votes for
                option B)
              </h1>
            </motion.div>

            <motion.div
              className="mt-[103px] w-[760px] h-[595px]"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Image
                src={VotesMinaAmount}
                alt="Votes Mina Amount"
                width={760}
                height={595}
              />
            </motion.div>

            <motion.div
              className="mt-[170px] text-center w-[860px] flex flex-col space-y-[58px] items-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                All counters now have their own final result zk-proof. How do we
                know which one is correct? We don't, zkVot does. Remember that
                the election was created on <span className="italic">Mina</span>{" "}
                blockchain? People submit their final result to Mina where
                election was created.
              </h1>
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                The election created on Mina blockchain is designed to accept
                only the zk-proofs that are valid.
              </h1>
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                So we eliminated the invalid results, but still, we have
                multiple valid results. Which one is the final result?
              </h1>
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                Since counters can create a final result proof that only
                includes the votes they prefer, we need a way to select the
                final result that is fair to everyone.
              </h1>
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                It's simple, whoever has the most votes in their final result
                proof wins. This is the final result of the election.
              </h1>
              <Image
                src={AllCounters}
                alt="All Counters"
                width={360}
                height={81}
              />
              <h1 className="text-white font-montserrat text-[16px] leading-[32px]">
                Hooraay! You and your friends made a decision together fully
                privately and securely.
              </h1>
            </motion.div>

            <motion.div
              className="w-full h-[135px] mt-[104px]"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
            >
              <Image
                src={FacesLine}
                alt="Faces Line"
                width={1204}
                height={135}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
