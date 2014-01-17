#!/bin/sh

mkdir lib
cd lib

git clone https://github.com/khibino/haskell-relational-record
git clone https://github.com/krdlab/haskell-relational-record-driver-mysql
git clone https://github.com/krdlab/hdbc-mysql
cd -

cabal sandbox init
cabal sandbox add-source \
    lib/haskell-relational-record/names-th \
    lib/haskell-relational-record/sql-words \
    lib/haskell-relational-record/persistable-record \
    lib/haskell-relational-record/relational-query \
    lib/haskell-relational-record/relational-schemas \
    lib/haskell-relational-record/HDBC-session \
    lib/haskell-relational-record/relational-query-HDBC
cabal sandbox add-source lib/haskell-relational-record-driver-mysql
cabal sandbox add-source lib/hdbc-mysql
