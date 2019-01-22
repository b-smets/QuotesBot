#!/bin/bash

SLACK_SIGNING_SECRET=$1
firebase functions:config:set quotesbot.signing_secret="$1"
