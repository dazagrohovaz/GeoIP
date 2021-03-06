var dns = require('dns'),
CONST = Object.freeze(require('../include/constants.js')),
seekCountry = require('./utils.js').seekCountry,
ipToLong = require('./utils.js').ipToLong,
strToArray = require('./utils.js').strToArray,
strToObj = require('./utils.js').strToObj;

/******************************************************************************
 * Inner Functions
 ******************************************************************************/
function __getOrg__(data, ipnum){
  var id, buffer, org, str, begin, end;

  id = seekCountry(data, ipnum);
  if (id <= 1) {
    return null;
  }

  begin  = id + (2 * data.record_length) * data.db_segments;
  end = begin + CONST.MAX_ORG_RECORD_LENGTH;
  buffer = data.buffer;
  org_buf = data.buffer.slice(begin, end);
  str = org_buf.toString('utf8', 0, org_buf.length);
  org = str.split(0, str.indexOf('\u0000'));

  return org;
}

/******************************************************************************
 * Export Functions
 ******************************************************************************/
 // Synchronous method
var org_by_addr = function(data, addr) {
  var ipnum, org, err;
  if (data.db_type !== CONST.ORG_EDITION) {
    err = new Error('Err: Not Organization Data');
    throw err;
  } 
  ipnum = ipToLong(addr);
  org =  __getOrg__(data, ipnum);
  if (!org) {
    return null;
  } else {
    return strToArray(org, '\u0000');
  }
};


// Asynchronous method
var org_by_domain = function(data, domain, callback) {
  var org, err, ipnum, seek;
  if (data.db_type !== CONST.ORG_EDITION) {
    err = new Error('Not Organization Data');
    callback(err, org);
  } else {
    dns.resolve(domain, rrtype='A', function(error, addresses) {
      if (error) {throw error;}
      ipnum = ipToLong(addresses[0]);
      seek = __getOrg__(data, ipnum);
      if (!seek) {
        org = null; // Not found
        //err = new Error('Err: Organization Not Found');
      } else {
        org = strToArray(seek, '\u0000');
      }
      callback(err, org);
    });
  }
};

// Synchronous method
var asn_by_addr = function(data, addr) {
  var ipnum, asn, err;
  if (data.db_type !== CONST.ASNUM_EDITION) {
    err = new Error('Err: Not ASNUM Data');
    throw err;
  }
    ipnum = ipToLong(addr);
    asn = __getOrg__(data, ipnum);
    if (!asn) {
      return null;
    } else {
      return strToObj(asn, '\u0000');
    }
};

// Asynchronous method
var asn_by_domain = function(data, domain, callback) {
  var asn, err, ipnum, seek;
  if (data.db_type !== CONST.ASNUM_EDITION) {
    err = new Error('Not ASNUM Data');
    callback(err, asn);
  } else {
    dns.resolve4(domain, function(error, addresses) {
      if (error) {throw error;}
      ipnum = ipToLong(addresses[0]);
      seek = __getOrg__(data, ipnum);
      if (!seek) {
        asn = null;
      } else {
        asn = strToObj(seek, '\u0000');
      }
      callback(err, asn);
    });
  }
};

/* Need passed test in future version
 exports.isp_by_addr = function(data, addr) {
   var ipnum;
   if (data.db_type === CONST.ISP_EDITION) {
     return 'Err: Not ISP Data';
   } else {
     if (addr === null) {
       return 0;
     }
     ipnum = ipToLong(addr);
     return __getOrg__(data, ipnum);
   }
 };
*/

org_by_addr._usage = 'Org.org_by_addr(data, <IP>)'; 
exports.org_by_addr = org_by_addr;

org_by_domain._usage = 'Org.org_by_domain(data, <DOMAIN>, <CALLBACK>)'; 
exports.org_by_domain = org_by_domain;

asn_by_addr._usage = 'Org.asn_by_addr(data, <IP>)';
exports.asn_by_addr = asn_by_addr;

asn_by_domain._usage = 'Org.asn_by_domain(data, <DOMAIN>, <CALLBACK>)';
exports.asn_by_domain = asn_by_domain; 
