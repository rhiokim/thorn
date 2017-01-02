#!/bin/bash

./nxtool.py -c nxapi.json -s 10.40.219.150 -f --slack --colors | grep BasicRule
