import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Radio, RadioGroup, Tab, Tabs, TextField, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';

interface PartnerRegisterDialogProps {
  open: boolean;
  onClose: () => void;
}

const bankOptions = [
  { label: 'みずほ銀行' },
  { label: '三菱UFJ銀行' },
  { label: '三井住友銀行' },
];

const branchOptions = [
  { label: '東京支店' },
  { label: '大阪支店' },
  { label: '名古屋支店' },
];

export default function PartnerRegisterDialog({ open, onClose }: PartnerRegisterDialogProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    displayName: '',
    officialName: '',
    ocrName: '',
    companyNameKana: '',
    corporateNumber: '',
    invoiceRegistrationNumber: '',
    corporateType: '法人',
    address: '',
  });
  const [paymentData, setPaymentData] = useState({
    closingDate: '',
    feeType: 'OURS',
    bankAccounts: [{
      bankName: '',
      branchName: '',
      accountType: '',
      accountNumber: '',
      accountHolder: '',
    }],
  });
  const [bankOptions, setBankOptions] = useState<{ label: string, value: string, searchKeys: string[] }[]>([]);
  const [branchOptions, setBranchOptions] = useState<{ label: string, value: string, searchKeys: string[] }[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const updatedBankAccounts = [...paymentData.bankAccounts];
    updatedBankAccounts[index] = { ...updatedBankAccounts[index], [name]: value };
    setPaymentData({ ...paymentData, bankAccounts: updatedBankAccounts });
  };

  const handleAddBankAccount = () => {
    setPaymentData({
      ...paymentData,
      bankAccounts: [...paymentData.bankAccounts, {
        bankName: '',
        branchName: '',
        accountType: '',
        accountNumber: '',
        accountHolder: '',
      }],
    });
  };

  const handleRemoveBankAccount = (index: number) => {
    const updatedBankAccounts = paymentData.bankAccounts.filter((_, i) => i !== index);
    setPaymentData({ ...paymentData, bankAccounts: updatedBankAccounts });
  };

  const handleInquiry = async () => {
    try {
      const response = await fetch(`/api/corporation?corporateNumber=${formData.corporateNumber}`);
      if (!response.ok) {
        throw new Error('法人情報の取得に失敗しました');
      }
      const data = await response.json();
      console.log('法人情報:', data);
      // 取得した名称(corporateNumberInfo.name)をdisplayNameとofficialNameとocrNameに設定
      setFormData({
        ...formData,
        displayName: data.corporateNumberInfo.name,
        officialName: data.corporateNumberInfo.name,
        ocrName: data.corporateNumberInfo.name,
        companyNameKana: data.corporateNumberInfo.furigana,
        address: data.corporateNumberInfo.prefectureName + data.corporateNumberInfo.cityName + data.corporateNumberInfo.streetNumber
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBranches = async (bankCode: string) => {
    try {
      const response = await fetch(`/api/banks/${bankCode}/branches`);
      if (!response.ok) {
        throw new Error('支店情報の取得に失敗しました');
      }
      const data = await response.json();
      setBranchOptions(data.branches.map((branch: { name: string, code: string, fullWidthKana: string, hiragana: string }) => ({
        label: branch.name,
        value: branch.code,
        searchKeys: [branch.name, branch.code, branch.fullWidthKana, branch.hiragana]
      })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('/api/banks');
        if (!response.ok) {
          throw new Error('銀行情報の取得に失敗しました');
        }
        const data = await response.json();
        setBankOptions(data.banks.map((bank: { name: string, code: string, fullWidthKana: string, hiragana: string }) => ({
          label: bank.name,
          value: bank.code,
          searchKeys: [bank.name, bank.code, bank.fullWidthKana, bank.hiragana]
        })));
      } catch (error) {
        console.error(error);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    if (paymentData.bankAccounts.length > 0 && paymentData.bankAccounts[0].bankName) {
      fetchBranches(paymentData.bankAccounts[0].bankName);
    }
  }, [paymentData.bankAccounts[0].bankName]);
  // TODO: 0番目の銀行を変更したときのみ、支店が変更されるようになっているため要修正

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerData: {
            ...formData,
            closingDate: paymentData.closingDate,
            feeType: paymentData.feeType,
          },
          bankAccounts: paymentData.bankAccounts,
        }),
      });

      if (!response.ok) {
        throw new Error('取引先の登録に失敗しました');
      }

      const result = await response.json();
      console.log('登録成功:', result);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>取引先登録</DialogTitle>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="partner registration tabs">
        <Tab label="基本情報" />
        <Tab label="支払情報" />
      </Tabs>
      <DialogContent sx={{ height: '400px', overflowY: 'auto' }}>
        {tabIndex === 0 && (
          <Box component="form" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="法人番号／インボイス番号"
                name="corporateNumber"
                sx={{ width: '50%' }}
                margin="normal"
                value={formData.corporateNumber}
                onChange={handleInputChange}
                placeholder="1234567890123"
              />
              <Button variant="outlined" onClick={handleInquiry}>
                国税庁照会
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="表示用名称 (必須)"
                name="displayName"
                fullWidth
                margin="normal"
                required
                value={formData.displayName}
                onChange={handleInputChange}
              />
              <TextField
                label="正式名称"
                name="officialName"
                fullWidth
                margin="normal"
                value={formData.officialName}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="OCR取引先名 (必須)"
                name="ocrName"
                fullWidth
                margin="normal"
                required
                value={formData.ocrName}
                onChange={handleInputChange}
              />
              <TextField
                label="企業名カナ"
                name="companyNameKana"
                fullWidth
                margin="normal"
                value={formData.companyNameKana}
                onChange={handleInputChange}
              />
            </Box>
            <Typography variant="subtitle1">法人区分</Typography>
            <RadioGroup
              row
              name="corporateType"
              value={formData.corporateType}
              onChange={(e) => setFormData({ ...formData, corporateType: e.target.value })}
            >


              <FormControlLabel value="CORPORATION" control={<Radio />} label="法人" />
              <FormControlLabel value="INDIVIDUAL" control={<Radio />} label="個人" />
              <FormControlLabel value="UNSPECIFIED" control={<Radio />} label="未指定" />
            </RadioGroup>
            <TextField
              label="住所"
              name="address"
              fullWidth
              margin="normal"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box component="form" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="締日"
                name="closingDate"
                sx={{ width: '33%' }}
                margin="normal"
                value={paymentData.closingDate}
                onChange={(e) => setPaymentData({ ...paymentData, closingDate: e.target.value })}
              >
                <MenuItem value={32}>月末</MenuItem>
                {[...Array(28).keys()].map(day => (
                  <MenuItem key={day + 1} value={day + 1}>{day + 1}日</MenuItem>
                ))}
              </TextField>
              <Box>
                <Typography variant="subtitle1">手数料負担</Typography>
                <RadioGroup
                  row
                  name="feeType"
                  value={paymentData.feeType}
                  onChange={(e) => setPaymentData({ ...paymentData, feeType: e.target.value })}
                >
                  <FormControlLabel value="OURS" control={<Radio />} label="当方負担" />
                  <FormControlLabel value="THEIRS" control={<Radio />} label="先方負担" />
                </RadioGroup>
              </Box>
            </Box>
            {paymentData.bankAccounts.map((account, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={bankOptions}
                    getOptionLabel={(option) => option.label}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(option =>
                        option.searchKeys.some(key => key.includes(inputValue))
                      )
                    }
                    value={bankOptions.find(option => option.value === account.bankName) || null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="金融機関"
                        name="bankName"
                        fullWidth
                        margin="normal"
                      />
                    )}
                    onChange={(event, newValue) => {
                      const updatedBankAccounts = [...paymentData.bankAccounts];
                      updatedBankAccounts[index] = { ...updatedBankAccounts[index], bankName: newValue ? newValue.value : '', branchName: '' };
                      setPaymentData({ ...paymentData, bankAccounts: updatedBankAccounts });

                      if (!newValue) {
                        setBranchOptions([]);
                      }
                    }}
                  />
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={branchOptions}
                    getOptionLabel={(option) => option.label}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(option =>
                        option.searchKeys.some(key => key.includes(inputValue))
                      )
                    }
                    value={branchOptions.find(option => option.value === account.branchName) || null}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="支店"
                        name="branchName"
                        fullWidth
                        margin="normal"
                        disabled={!account.bankName}
                      />
                    )}
                    onChange={(event, newValue) => {
                      const updatedBankAccounts = [...paymentData.bankAccounts];
                      updatedBankAccounts[index] = { ...updatedBankAccounts[index], branchName: newValue ? newValue.value : '' };
                      setPaymentData({ ...paymentData, bankAccounts: updatedBankAccounts });
                    }}
                  />
                  <TextField
                    sx={{ flex: 1 }}
                    select
                    label="預金種目"
                    name="accountType"
                    fullWidth
                    margin="normal"
                    value={account.accountType}
                    onChange={(e) => handlePaymentInputChange(index, e)}
                  >
                    <MenuItem value="1">普通</MenuItem>
                    <MenuItem value="2">当座</MenuItem>
                    <MenuItem value="4">貯蓄</MenuItem>
                    <MenuItem value="9">その他</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="口座番号"
                    name="accountNumber"
                    fullWidth
                    margin="normal"
                    value={account.accountNumber}
                    onChange={(e) => handlePaymentInputChange(index, e)}
                    placeholder="1234567"
                  />
                  <TextField
                    label="口座名義人"
                    name="accountHolder"
                    fullWidth
                    margin="normal"
                    value={account.accountHolder}
                    onChange={(e) => handlePaymentInputChange(index, e)}
                    placeholder="カ）エヌティティデータ"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleRemoveBankAccount(index)} color="error">
                    <RemoveCircleIcon />
                  </IconButton>
                  <IconButton onClick={handleAddBankAccount} color="primary">
                    <AddCircleIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          キャンセル
        </Button>
        <Button onClick={handleRegister} color="primary">
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
} 