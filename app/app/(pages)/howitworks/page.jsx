"use client";
import React from "react";
import Face1SVG from "@/assets/howitworks/face1.svg";
import Face2SVG from "@/assets/howitworks/face2.svg";
import Face3SVG from "@/assets/howitworks/face3.svg";
import Face4SVG from "@/assets/howitworks/face4.svg";
import WhyZkProof from "@/assets/howitworks/WhyZkProofs.svg";
import BlueQuestionMark from "@/assets/howitworks/BlueQuestionMark.svg";
import FacesCircle from "@/assets/howitworks/facesCircle.svg";
import ThinkingFaces from "@/assets/howitworks/thinkingFaces.svg";
import VotesMinaAmount from "@/assets/howitworks/votesMinaAmount.svg";
import AllCounters from "@/assets/howitworks/allCounters.svg";
import FacesLine from "@/assets/howitworks/facesLine.svg";
import Image from "next/image";

const Page = () => {
  return (
    <div className="flex justify-center ">
      <div className="w-[1280px] flex flex-col justify-center items-center ">
        <div className="mt-14 w-full  flex flex-col">
          <div className="flex flex-col items-start mb-4">
            <h1 className="text-primary text-[64px]">
              # zkVot - <span className="italic">How it works?</span>
            </h1>
          </div>
          <div className="pl-4 w-full flex flex-col items-center mb-28 ">
            <div className="mt-10 w-full flex items-center">
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
            </div>
            <div className="mt-[60px] w-full h-[170px] flex justify-end pr-8 ">
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
                <div className="absolute bottom-0 right-0 ">
                  <Image
                    src={Face2SVG}
                    alt="Face 1"
                    width={240}
                    height={140}
                  />
                </div>
              </div>
            </div>
            <div className="mt-[55px] w-[1140px] h-[290px] flex items-center justify-center relative ">
              <div className="absolute w-[278px] h-[217px] top-0 left-0">
                <Image
                  src={Face3SVG}
                  alt="Face 3"
                  width={278}
                  height={217}
                />
              </div>
              <div className="mb-4">
                <h1>
                  You see you are a voter in the election, and you want to vote.
                </h1>
                <h1 className="w-[477px] pt-2">
                  You select the option you want to vote for, and you create a
                  *zk-proof* with a click of a button in app.
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
            </div>
            <div className="mt-[60px] flex w-full justify-center">
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
                    <h1 className="ml-2">
                      Why do we need a zk-proof? Because the generated zk-proof
                      shows
                    </h1>
                    <h1 className="ml-4">
                      thay someone who is eligible to vote, voted for a specific
                      option
                    </h1>
                    <h1 className="ml-2">
                      without revealing the voter's identity. This is the magic
                      of zk-proofs.
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-[140px] w-[956px] h-[532] flex items-center justify-center relative">
              <Image
                src={FacesCircle}
                alt="Faces Circle"
                width={956}
                height={532}
              />
              <div className="absolute">
                <div className="flex flex-col items-center justify-center w-[595px] text-center">
                  <h1 className="text-[24px]">Is it done?</h1>
                  <h1>
                    No, you submit your vote proof to a place *where anyone in
                    the world can see it*. Remember that it doesn't reveal your
                    identity, but it shows that someone voted for a specific
                    option.
                  </h1>
                </div>
              </div>
            </div>
            <div className="mt-[108px] w-[815px]">
              <h1 className="text-center">
                Now who will count the votes? The answer is simple: everyone who
                wants to count the votes. Since all the votes are public, anyone
                can count the votes. (even you)
              </h1>
            </div>
            <div className="mt-[80px] text-center w-[815px] flex flex-col relative">
              <Image
                src={ThinkingFaces}
                alt="Thinking Faces"
                width={778}
                height={269}
              />
              <h1 className="mt-[57px]">
                The counters *read all the vote proofs*, and they verify that
                the zk-proofs are valid. They combine the valid proofs and
                generate a final result zk-proof. This final result cannot be
                faked with fake votes, and it shows the final result of the
                election. (example: 10 votes for option A, 5 votes for option B)
              </h1>
            </div>
            <div className="mt-[103px] w-[760px] h-[595px]">
              <Image
                src={VotesMinaAmount}
                alt="Votes Mina Amount"
                width={760}
                height={595}
              />
            </div>
            <div className="mt-[170px] text-center w-[860px] flex flex-col space-y-[58px] items-center">
              <h1>
                All counters now have their own final result zk-proof. How do we
                know which one is correct? We don't, zkVot does. Remember that
                the election was created on *Mina* blockchain? People submit
                their final result to Mina where election was created.
              </h1>
              <h1>
                The election created on Mina blockchain designed to accept only
                the zk-proofs that are valid.
              </h1>
              <h1>
                So we eliminated the invalid results, but still, we have
                multiple valid results. Which one is the final result?
              </h1>
              <h1>
                Since counters can create a final result proof that only
                includes the votes they prefer, we need a way to select the
                final result that is fair to everyone.
              </h1>
              <h1>
                It's simple, whoever has the most votes in their final result
                proof wins. This is the final result of the election.
              </h1>
              <Image
                src={AllCounters}
                alt="All Counters"
                width={360}
                height={81}
              />
              <h1>
                Hooraay! You and your friends made a decision together fully
                privately and securely.
              </h1>
            </div>
            <div className="w-full h-[135px] mt-[104px]">
              <Image
                src={FacesLine}
                alt="Faces Line"
                width={1204}
                height={135}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
