# Swarmbox
Desktop app for Swarm, P2P Decentralized Storage


## Introduction ##
This app is a desktop app for your personal storage on Swarm, the decentralized distributed and incentivized P2P storage.
For more on Swarm, check [http://swarm-gateways.net/bzz://theswarm.eth|Swarm].

The app provvides a distributed personal file storage, where the user is in control of her files.
It can't be censored, nor can anybody prevent the user from accessing files.

Note, however, that due to the public nature of Swarm, the user's files are not protected from unauthorized access.
Whoever has access to the root hash of the Swarmbox, can access the files.
Thus, please be careful of what you upload onto Swarm, it shouldn't be anything sensible like 
personal information, financial information, or anything a third party should not be allowed to see.

Please take the time to read and understand about Swarm prior to use this app.
Again, see [http://swarm-gateways.net/bzz://theswarm.eth|Swarm].


## Prerequisites ##
### Swarm ###
This app is suggested to run together with a local node of Swarm.
Prior to run this app, it is encouraged to download, install and start a local node of Swarm.
The app will try to connect via HTTP at [http://localhost:8500/bzz:/] in order to connect to Swarm.

There is a fail over built in which will try to use the public gateway at 
[http://swarm-gateways.net | http://swarm-gateways.net].
However, Swarm public gateways may be restricted in their usage, usually limiting the upload size of files and directories.
Other restrictions may apply. Also, there is no guarantee the public gateway will be up and running always.

Thus, we encourage again to download, install and run a local Swarm node.
With this, you also contribute to a more decentralized internet and are actively contributing to the success of Swarm.

### OS ###
This app is written with [http://electron.atom.io | electron], a multi-platform development environment for the [http://nodejs.org | node ] programming language.
Electron allows in principle to write portable applications, and thus, Swarmbox should run on all major platforms on which electron can compile applications,
namely linux, OSX, and Windows.

Nevertheless, as Swarmbox also accesses the host's file system, which has OS-specific behaviors, some inconsistencies and incompatibilities across the different OSes may occur.
At the moment, Swarmbox only can reliably run on **linux**, while other **POSIX** systems should be supported too.
On the other hand, it probably *won't run reliably on Windows*. Having said that, Windows support should sonn be available.

## Installation ##
We currently **don't provide pre-compiled binaries** for Swarmbox.
The easiest way to install Swarmbox is to clone the repository and install the dependencies:

The following assumes nodejs has been installed on your system already.
If it isn't, follow installation instructions for nodejs for your platform at [http://nodejs.org | nodejs.org ].

* `git clone http://github.com/holisticode/swarmbox`
* cd swarmbox
* npm install
* npm install -g electron
* npm install -g bower
* bower install

The above should allow you to install all required modules.
To start the application then enter the directory where you cloned the repo, e.g. `/home/youruser/swarmbox`, and execute `electron .` (the dot at the end is required).

Please consider Swarmbox to be experimental for the time being, as is it's underlying technology, Swarm.
Expect bugs and problems to occur. You may use the issues system of this github repo to provide bug reports or suggest changes.

## Usage ##
The app will first ask the user to indicate if she already has a Swarmbox hash from any earlier upload.
If the user has this hash, it should be provdied. The app will try to connect to Swarm and download the existing swarmbox.
This will then be shown in the right-hand sidepane. 
On the left-hand sidepane, the local filesystem browser is displayed.

If the user doesn't have an existing swarmbox, the app prompts the user to browse for a directory on the local filesystem,
inviting the user to upload the chosen directory. If the user chooses a directory for upload, the app will use that one
as the swarmbox directory.

The user can drag files from the left-hand sidepane (local filesystem) to the right-hand sidepane (swarmbox).
This will upload the new file(s) or directory to the user's swarmbox.
Note that this changes the root hash for the user's swarmbox. The app maintains a history of the user's swarmbox hashes
in the `.swarmbox-hash` file. The first line in this file represents the latest hash of the user's swarmbox.
Please read the Swarm documentation to understand what these hashes are and how Swarm handles them.

The user can also drag files from the swarmbox onto her local filesystem on the left-hand sisepane.

Finally, the user can also drag files and directories onto swarm, but outside of her personal swarmbox.
In order to do so, the user can drag a file from the left-hand sidepane, the filebrowser, onto the 
bottom left-hand pane ("Drag files here to upload to swarm"). This would upload files to swarm
which are independently available. Such an upload will return a hash, which represents the key to find the resource again.
The user can choose to save this key to her local list of hashes by hitting the "Add To My Hashes" button after upload.
This will save the hash in the personal list, which can be visualized in the tab "Transfers".

The list of transfer hashes is saved locally on disk in the `.swarm-history` file as a JSON object.
