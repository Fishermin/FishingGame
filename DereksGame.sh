#!/usr/bin/env bash
echo ".... Loading ...."
sleep 2
if [[ ! -e fishscorehistory.txt ]]; then
    touch fishscorehistory.txt
else
	mapfile fishscorehistory < fishscorehistory.txt
fi
IFS=$'\n'
fishscorehistory=( $(printf "%s\n" ${fishscorehistory[@]} | sort -rn | head -10) )  ## reverse sort
clear
echo "  ____                _    _       _____ _     _     _                ____                       "
echo " |  _ \  ___ _ __ ___| | _( )___  |  ___(_)___| |__ (_)_ __   __ _   / ___| __ _ _ __ ___   ___  "
echo " | | | |/ _ \ '__/ _ \ |/ /// __| | |_  | / __| '_ \| | '_ \ / _' | | |  _ /  ' | '_ ' _ \ / _ \ "
echo " | |_| |  __/ | |  __/   <  \__ \ |  _| | \__ \ | | | | | | | (_| | | |_| | (_| | | | | | |  __/ "
echo " |____/ \___|_|  \___|_|\_\ |___/ |_|   |_|___/_| |_|_|_| |_|\__, |  \____|\__,_|_| |_| |_|\___| "
echo "_________________________________________________________________________________________________"
echo ""
echo " TOP 10 Scores all time:"
echo ""
echo " Score, Angler, Day/time"
echo ""
printf '%s\n' "${fishscorehistory[@]}"
echo ""
echo "Welcome to Derek's Fishing Game. Please enter your name: "
read name
name=${name,,}
name=${name^}
echo ""
sleep 1
if [[ $name == "Cheater" ]]; then
	echo "Cheat mode enabled you slimeball"
else
echo "Welcome, $name."
fi
echo "You'll get 10 casts."
echo "Each fish caught will be scored by size and rarity."
echo "Scores from all fish caught will be totalled to give a final score"
sleep 3
echo ""
read -p "Press enter to get fishing"
bestscore=0
turns=10
totscore=0
castcounter=1
bestfish="None yet"
bonus=0
while [ $turns -gt 0 ]; do
	FishBiteOn=$(( $RANDOM % 3 + 1 ))
	clear
	sleep 1
	echo ""
	echo "Current Angler     : $name"
	echo "Current Score      : $totscore"
        echo "Current Best       : $bestfish"
	echo "Current Cast Number: $castcounter"
	echo "Casts Remaining    : $turns"
	echo ""
	echo "Fish Classes:"
	echo ""
	echo "        Tier 1                   Tier 2                   Tier 3"
	echo "	Bigmouth Buffalo         Dogfish                  Walleye"
	echo "	Carp                     Yellow Perch             Musky"
	echo "	Bullhead                 Flathead Catfish         Lake Sturgeon"
	echo "	Sheepshead               Eelpout                  Blue Catfish"
	echo "	Longnose Gar             Smallmouth Bass"
	echo "	Bluegill                 Sauger"
	echo "	Pike"
	echo "	Largemouth Bass "
	echo "	Crappie"
	echo "	Channel Catfish"
	echo ""
	echo "************************************************************************"
	echo ""
	echo "Lets pick your bait"
	echo "You can choose between worms, minnows, leeches, or a lure. (pick one)"
	echo ""
	echo "************************************************************************" 
	echo "1) Worms"
	echo "2) Minnow"
	echo "3) Leech"
	echo "4) Try a Lure"
	echo "************************************************************************"
	echo ""
	helperlist=("Scott" "Derek" "Riley" "Evan" "Kade" "Ava" "Linda" "Joe" "Ethan" "Dennis")
	helper=${helperlist[RANDOM%${#helperlist[@]}]}
	while [ "$name" == "$helper" ]
	do
		helper=${helperlist[RANDOM%${#helperlist[@]}]}
	done	
	LureList=("Original Rapala" "Jointed Rapala" "SuperDuper" "Swedish Pimple" "Lazy Ike" "RattleTrap" "Lindy-Rig" "Mepps Agilia" "Bucktail Jig" "Silver Minnow" "Daredevil" "Jig and Mr.Twister" "Whopper Plopper" "Hula Popper" "Spinnerbait" "Berkly Flickershad" "Topwater Frog" "Blade Bait" "Jigging Rap" "Husky Jerk" "Beetlespin" "Jawbreaker" "Tube Bait" "Buzzbait" "Chatter Bait" "Panther Martin" "Kastmaster" "Wally Diver")
	LureColors=("pink and white" "Pink" "White" "Black and Green" "Chartreuse" "Black and Orange" "Silver" "Blue and Black" "Yellow" "Firetiger" "Purple" "Green" "White" "Glowing" "Red and White" "Lime" "Pumpkin" "Chrome" "Gold" "Glowing" "Rusty" "Lucky")
	read -p "Enter 1-4 to determine bait choice:" guess
	echo ""
	echo ""
	case $guess in
		1)
			echo "You thread on a juicy crawler and eye some ripples 30 feet from shore"
			;;
		2)
			echo "You add a lively fathead to a ${LureColors[RANDOM%${#LureColors[@]}]} jig and swing your rod behind you"
			;;
		3)
			echo "You pry a wriggling leech from the icy bait bin, and add it to a hook below your slip bobber"
			;;
		4)	
			echo "Let's open the tacklebox and see what looks lucky"
			echo "..."
			sleep 2
			echo "hmm..."
			sleep 2
			echo "..."
			echo "After digging through your tackle a while, you settle on a ${LureColors[RANDOM%${#LureColors[@]}]} ${LureList[RANDOM%${#LureList[@]}]} and prepare for a long cast in front of you."
			;;
		*)	echo "Ok, So you have other plans. $helper suggests you try a ${LureColors[RANDOM%${#LureColors[@]}]} ${LureList[RANDOM%${#LureList[@]}]} so you tie it on. ";;
		esac
		echo ""
	read -p "Press enter to cast"
	clear
	sleep 1
	echo " @                                       "
        sleep .4
	echo "          @                              "
        sleep .3
	echo "              @                          "
        sleep .25
	echo "                  @                      "
	sleep .15
	echo "--------------------@--------------------"
	sleep $(( $RANDOM % 15 + 1 ))
	echo "                    @                    "
	sleep 1
	echo "                    @                    "
        sleep .75
	echo "                    @                    "
        sleep .6
	echo "                    @                    "
	sleep .45
	echo "                    @                    "
        sleep .3
	echo "                    @                    "
        sleep .25
	echo "                    @                    "
        sleep .2
	echo "                    @                    "
        sleep .15
	echo "                    @                    "
        sleep .1
	echo "                    @                    "
        sleep .1
	echo "                    @                    "
        sleep .1
	echo "                    @                    "
        sleep .1






	fishlist=( "Bigmouth Buffalo" "Carp" "Bullhead" "Sheepshead" "Longnose Gar" "Bluegill" "Pike" "Largemouth Bass"  "Crappie" "Channel Catfish" "Dogfish" "Yellow Perch" "Flathead Catfish" "Eelpout" "Smallmouth Bass" "Sauger" "Walleye" "Musky" "Lake Sturgeon" "Blue Catfish" )
        fishsize=("tiny" "small" "standard" "decent" "beefy" "big" "huge" "mammoth" "GIANT" "state record")
	petlist=("Rizzo" "Dixie" "Suzie" "Cooper" "a stray dog")
	
	catch=${fishlist[RANDOM%${#fishlist[@]}]}
	catchscore=$(( $RANDOM % 100 + 1 ))
	case $catchscore in
		([1-9]|10) size="Tiny";;
		(1[1-9]|2[0-9]|30) size="Small";;
		(3[1-9]|4[0-9]|50) size="Standard";;
	  	(5[1-9]|6[0-9]|70) size="Decent";;
		(7[1-9]|80) size="Beefy";;
		(8[1-7]) size="Big";;
		(8[89]|9[0-2]) size="Huge"
			bonus=5;;
		(9[3-5]) size="Giant"
			bonus=10;;
		(9[6-8]) size="Mammoth"
			bonus=15;;
		(99|100) size="State Record"
			bonus=20;;	
	
	
	esac

	for i in "${!fishlist[@]}"; do
		if [[ "${fishlist[$i]}" = $catch ]]; then
			fishindex=$i
		fi
		
	done
		
	
	case $fishindex in
		([0-9]|10) multiplier1=1;;
		(1[1-6]) multiplier1=2;;
		(1[7-9]|20) multiplier1=3;;
        esac
	
	pet=${petlist[RANDOM%${#petlist[@]}]}
	echo ""
 	echo "You start reeling..."
	echo ""
	sleep 2
        echo "You quickly adjust your drag..."
        echo ""
	sleep 2
	if [[ $name == "Cheater" ]]; then 
		FishBiteOn=1
	fi
	if [[ $FishBiteOn == 1 ]]; then
		echo "$helper reaches to help with the net and scoops..."
        	echo ""
		sleep 3
		echo "a $size $catch!"
		echo ""
		echo "Congrats $name!"
		echo ""
		sleep 2
		if [[ $catch = "Bullhead" ]]||[[ $catch = "Sheepshead" ]]; then
		echo "You've unlocked a Bull and Mutton sponsored, FREE CAST for your $catch!"
		turns=$(( $turns + 1 ))
	fi
		read -p "Press enter to continue"
		echo ""
		echo "SCORING:"
		echo ""
		echo "Your $catch is a $size sized fish and scores $catchscore points"
		echo ""
		sleep 3
		echo "$catch are tier $multiplier1 multiplier fish species"
		fishscore=$(( $catchscore * $multiplier1 ))
		echo ""
		echo "Your $size $catch has a base score of $catchscore , with a tier $multiplier1 multiplier, scores : $fishscore"
		echo ""
		if [[ $bonus > 0 ]]; then
		sleep 2
			echo "$size sized fish are worth an extra $bonus points"
			fishscore=$(( $fishscore + $bonus ))
		bonus=0
		fi


		sleep 2
		echo ""
		totscore=$(( $totscore + $fishscore ))
		echo "$fishscore points has been added. Your new total score is $totscore "
		if (( $fishscore > $bestscore )); then
		sleep 2
			echo ""
			echo "This fish is your top scoring from this game"
			bestscore=$fishscore
			bestfish="Fish: $catch Size: $size Points: $fishscore"

		fi


	else
	nofish=("But all you lift out of the water, is a heavy log."
		"As you remove slack from your line, you realize you've snagged a rock. You break your line while trying to remove it. "
		"An immense pelican plunges from the sky to grab your $catch." 
		"A beaver suddenly surfaces, slaps its tail on top, swims off, and your line breaks violently"
		"A $catch leaps far from shore, just before a drunken pontooner runs over you line and breaks it off."
		"You start reeling only to notice a massive birdsnest in your reel. As you try to free it, you cut the wrong line and the fish swims off."
		"You get your catch next to shore only to notice a massive snapping turtle. You free the turtle, but your lure is lost"
		"$helper reaches out with the net and scoops.. but the feeble attempt only knocks the $size $catch off the hook"
		"Your eyes follow your taught line only to realize that $helper has cast over it"
		"And the handle falls off your reel. You try to pull the $catch in by hand but without success"
		"A sizeable $catch leaps from the water and throws your hook"
		"Your eyes follow your line all the way to a tree branch on the far shore. You bounce and pull your line, until it breaks."
		"But your line continues to pull as you tighten the drag until... SNAP. Its gone. The legends about the huge $catch at this spot are true."
		"You pull, fighting an immense force, but it is just a huge mass of weeds."
		"A wasp nest falls from the tree next to you, and you are suddenly attacked by a swarm of hornets and have no choice but to run to the truck"
		"$helper falls in the water while trying to help with the net. You have no choice but to help"
		"Suddenly $pet bolts after a racoon that scurries from a bush nearby. You give chase"
		"You hear a loud splash. $pet has jumped in after your $catch. Your line breaks before they reach your it"
		"You fight a small ${fishlist[RANDOM%${#fishlist[@]}]} all the way to shore, but a huge ${fishlist[RANDOM%${#fishlist[@]}]} grabs it before you can retrieve it, and snaps your line.")
	 	echo "${nofish[RANDOM%${#nofish[@]}]}"
	 	fi
		echo ""
		turns=$(( turns - 1 ))
		castcounter=$(( castcounter + 1 ))
		sleep 5
		read -p "Press enter to continue"
done
clear
 	echo "************************************************************************"
	echo ""
        echo "Current Angler: $name"
        echo "Final Score: $totscore"
        echo "Best Fish: $bestfish"
	echo ""
	echo "Thanks for playing"
        echo "************************************************************************"
	todaydatetime=$(date '+%m/%d/%Y %H:%M')
	if [[ $totscore > 0 ]] && [[ $name != "Cheater" ]]; then
		echo "$totscore $name $todaydatetime" >> fishscorehistory.txt
		echo "Scores added to history"
		sleep 2
	fi
	if [[ $name == "Cheater" ]]; then
		echo "Cheaters never win. Your score has been flushed"
		echo ""
	fi
	echo "*************************** TOP SCORES ALL TIME ***************************"
	echo ""
	echo ""
	read -p "Press enter to exit"






